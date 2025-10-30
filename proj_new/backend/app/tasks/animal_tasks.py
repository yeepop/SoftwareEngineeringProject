"""
Animal-related Celery Tasks
"""
import csv
import io
from datetime import datetime
from typing import Dict, Any

from app.celery import celery
from app import db
from app.models import Job, JobStatus, Animal, AnimalStatus, Shelter, MedicalRecord, RecordType, AnimalImage


@celery.task(bind=True, max_retries=3)
def process_animal_batch_import(self, job_id: int) -> Dict[str, Any]:
    """
    批次匯入動物資料 (支援多檔案架構)
    
    檔案:
    - animal_csv: 動物基本資訊 (必填)
    - medical_csv: 醫療記錄 (選填,多筆)
    - photos: 動物照片 (選填,檔名格式: {animal_code}_{order}.jpg)
    
    Args:
        job_id: Job ID
        
    Returns:
        處理結果統計
    """
    job = Job.query.get(job_id)
    if not job:
        return {'error': 'Job not found'}
    
    # 更新狀態為執行中
    job.status = JobStatus.RUNNING
    job.started_at = datetime.utcnow()
    db.session.commit()
    
    try:
        # 從 payload 取得參數
        shelter_id = job.payload.get('shelter_id')
        animal_csv_content = job.payload.get('animal_csv_content')
        medical_csv_content = job.payload.get('medical_csv_content')
        photos_data = job.payload.get('photos', [])
        options = job.payload.get('options', {})
        
        # 驗證必要參數
        if not shelter_id:
            raise ValueError('Missing shelter_id in job payload')
        
        if not animal_csv_content:
            raise ValueError('Missing animal_csv_content in job payload')
        
        # 驗證 shelter 存在
        shelter = Shelter.query.get(shelter_id)
        if not shelter:
            raise ValueError(f'Shelter {shelter_id} not found')
        
        # 統計
        stats = {
            'total_animals': 0,
            'success_animals': 0,
            'failed_animals': 0,
            'total_medical_records': 0,
            'success_medical_records': 0,
            'total_photos': 0,
            'success_photos': 0,
            'errors': []
        }
        
        # === 第一階段: 解析動物 CSV 並建立 animal_code → animal_id 映射 ===
        animal_code_map = {}  # {animal_code: animal_id}
        
        try:
            csv_reader = csv.DictReader(io.StringIO(animal_csv_content))
            headers = csv_reader.fieldnames
            
            # 驗證 CSV 標題
            required_headers = ['animal_code', 'name', 'species', 'breed', 'sex', 'dob', 'color', 'description']
            if not headers:
                raise ValueError('CSV file has no headers')
            
            missing_headers = [h for h in required_headers if h not in headers]
            if missing_headers:
                raise ValueError(f'CSV missing required headers: {", ".join(missing_headers)}')
                
        except Exception as e:
            raise ValueError(f'Invalid CSV format: {str(e)}')
        
        # 重新創建 reader (因為 fieldnames 消耗了迭代器)
        csv_reader = csv.DictReader(io.StringIO(animal_csv_content))
        
        for row_num, row in enumerate(csv_reader, start=2):
            stats['total_animals'] += 1
            
            # 錯誤太多時提前終止
            if stats['failed_animals'] > 100:
                raise ValueError(f'Too many errors ({stats["failed_animals"]}), aborting import')
            
            try:
                # 驗證必填欄位
                required_fields = ['animal_code', 'name', 'species', 'breed', 'sex', 'dob', 'color', 'description']
                missing_fields = [f for f in required_fields if not row.get(f) or not row[f].strip()]
                
                if missing_fields:
                    raise ValueError(f'Missing required fields: {", ".join(missing_fields)}')
                
                animal_code = row['animal_code'].strip()
                
                # 檢查重複的 animal_code
                if animal_code in animal_code_map:
                    raise ValueError(f'Duplicate animal_code: {animal_code}')
                
                # 驗證 species 值
                species = row['species'].strip().upper()
                if species not in ['CAT', 'DOG']:
                    raise ValueError(f'Invalid species: {species}. Must be CAT or DOG')
                
                # 驗證 sex 值
                sex = row['sex'].strip().upper()
                if sex not in ['MALE', 'FEMALE', 'UNKNOWN']:
                    raise ValueError(f'Invalid sex: {sex}. Must be MALE, FEMALE, or UNKNOWN')
                
                # 處理出生日期
                try:
                    from datetime import datetime as dt
                    dob = dt.strptime(row['dob'].strip(), '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError(f'Invalid date format for dob: {row["dob"]}. Use YYYY-MM-DD')
                
                # 建立動物物件
                animal = Animal(
                    shelter_id=shelter_id,
                    name=row['name'].strip(),
                    species=species,
                    breed=row['breed'].strip(),
                    sex=sex,
                    color=row['color'].strip(),
                    dob=dob,
                    description=row['description'].strip(),
                    status=AnimalStatus.DRAFT,
                    owner_id=job.created_by,  # 設置 owner_id
                    created_by=job.created_by,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                # 添加並 flush 以獲取 animal_id
                db.session.add(animal)
                db.session.flush()
                
                # 記錄映射
                animal_code_map[animal_code] = animal.animal_id
                stats['success_animals'] += 1
                
            except Exception as e:
                stats['failed_animals'] += 1
                stats['errors'].append({
                    'row': row_num,
                    'file': 'animal_csv',
                    'data': row,
                    'error': str(e)
                })
        
        # Commit 動物資料
        db.session.commit()
        
        # === 第二階段: 解析醫療記錄 CSV (選填) ===
        if medical_csv_content:
            medical_csv_reader = csv.DictReader(io.StringIO(medical_csv_content))
            
            for row_num, row in enumerate(medical_csv_reader, start=2):
                stats['total_medical_records'] += 1
                
                try:
                    # 驗證必填欄位
                    required_fields = ['animal_code', 'record_type', 'date']
                    missing_fields = [f for f in required_fields if not row.get(f) or not row[f].strip()]
                    
                    if missing_fields:
                        raise ValueError(f'Missing required fields: {", ".join(missing_fields)}')
                    
                    animal_code = row['animal_code'].strip()
                    
                    # 檢查 animal_code 是否存在
                    if animal_code not in animal_code_map:
                        raise ValueError(f'Unknown animal_code: {animal_code}. Animal not found in animal_csv')
                    
                    animal_id = animal_code_map[animal_code]
                    
                    # 驗證 record_type
                    record_type = row['record_type'].strip().upper()
                    if record_type not in ['TREATMENT', 'CHECKUP', 'VACCINE', 'SURGERY', 'OTHER']:
                        raise ValueError(f'Invalid record_type: {record_type}')
                    
                    # 處理醫療日期
                    try:
                        from datetime import datetime as dt
                        medical_date = dt.strptime(row['date'].strip(), '%Y-%m-%d').date()
                    except ValueError:
                        raise ValueError(f'Invalid date format: {row["date"]}. Use YYYY-MM-DD')
                    
                    # 創建醫療記錄
                    medical_record = MedicalRecord(
                        animal_id=animal_id,
                        record_type=RecordType[record_type],
                        date=medical_date,
                        provider=row.get('provider', '').strip() or None,
                        details=row.get('details', '').strip() or None,
                        verified=False,
                        created_by=job.created_by,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    
                    db.session.add(medical_record)
                    stats['success_medical_records'] += 1
                    
                except Exception as e:
                    stats['errors'].append({
                        'row': row_num,
                        'file': 'medical_csv',
                        'data': row,
                        'error': str(e)
                    })
            
            # Commit 醫療記錄
            db.session.commit()
        
        # === 第三階段: 處理照片 (選填) ===
        if photos_data:
            import re
            
            # 解析檔名格式: {animal_code}_{order}.{ext}
            filename_pattern = re.compile(r'^(.+?)_(\d+)\.[a-zA-Z]+$')
            
            for photo in photos_data:
                stats['total_photos'] += 1
                
                try:
                    filename = photo['filename']
                    match = filename_pattern.match(filename)
                    
                    if not match:
                        raise ValueError(f'Invalid filename format: {filename}. Expected: {{animal_code}}_{{order}}.{{ext}}')
                    
                    animal_code = match.group(1)
                    order = int(match.group(2))
                    
                    # 檢查 animal_code 是否存在
                    if animal_code not in animal_code_map:
                        raise ValueError(f'Unknown animal_code in filename: {animal_code}')
                    
                    animal_id = animal_code_map[animal_code]
                    
                    # 使用 MinIO URL 和 storage_key (照片已在 shelters.py 上傳到 MinIO)
                    image_url = photo['url']
                    storage_key = photo['storage_key']
                    
                    animal_image = AnimalImage(
                        animal_id=animal_id,
                        storage_key=storage_key,
                        url=image_url,
                        mime_type=photo.get('content_type', 'image/jpeg'),
                        order=order,
                        created_at=datetime.utcnow()
                    )
                    
                    db.session.add(animal_image)
                    stats['success_photos'] += 1
                    
                except Exception as e:
                    stats['errors'].append({
                        'file': 'photo',
                        'filename': photo.get('filename', 'unknown'),
                        'error': str(e)
                    })
            
            # Commit 照片記錄
            db.session.commit()
        
        # 更新 job 狀態為成功
        job.status = JobStatus.SUCCEEDED
        job.completed_at = datetime.utcnow()
        job.result_summary = {
            'animals': {
                'total': stats['total_animals'],
                'success': stats['success_animals'],
                'failed': stats['failed_animals']
            },
            'medical_records': {
                'total': stats['total_medical_records'],
                'success': stats['success_medical_records']
            },
            'photos': {
                'total': stats['total_photos'],
                'success': stats['success_photos']
            },
            'error_samples': stats['errors'][:20]  # 保存前20個錯誤
        }
        db.session.commit()
        
        return stats
        
    except Exception as exc:
        # Rollback 所有變更
        db.session.rollback()
        
        # 更新 job 狀態為失敗
        try:
            job = Job.query.get(job_id)  # 重新查詢 job (因為已 rollback)
            if job:
                job.status = JobStatus.FAILED
                job.completed_at = datetime.utcnow()
                job.result_summary = {
                    'error': str(exc),
                    'error_type': type(exc).__name__,
                    'traceback': __import__('traceback').format_exc()
                }
                db.session.commit()
        except Exception as update_error:
            print(f'Failed to update job status: {update_error}')
        
        # 重試機制
        if self.request.retries < self.max_retries:
            countdown = 60 * (2 ** self.request.retries)
            raise self.retry(exc=exc, countdown=countdown)
        
        raise


@celery.task(bind=True, max_retries=3)
def process_animal_batch_export(self, job_id: int) -> Dict[str, Any]:
    """
    批次匯出動物資料
    
    Args:
        job_id: Job ID
        
    Returns:
        處理結果
    """
    job = Job.query.get(job_id)
    if not job:
        return {'error': 'Job not found'}
    
    job.status = JobStatus.RUNNING
    job.started_at = datetime.utcnow()
    db.session.commit()
    
    try:
        # 從 payload 取得參數
        shelter_id = job.payload.get('shelter_id')
        filters = job.payload.get('filters', {})
        
        # 查詢動物
        query = Animal.query.filter_by(shelter_id=shelter_id, is_active=True)
        
        # 套用篩選
        if filters.get('species'):
            query = query.filter_by(species=filters['species'])
        if filters.get('status'):
            query = query.filter_by(status=filters['status'])
        
        animals = query.all()
        
        # 產生 CSV
        output = io.StringIO()
        fieldnames = [
            'animal_id', 'name', 'species', 'breed', 'age', 'gender',
            'color', 'size', 'health_status', 'vaccination_status',
            'sterilization_status', 'status', 'created_at'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for animal in animals:
            writer.writerow({
                'animal_id': animal.animal_id,
                'name': animal.name,
                'species': animal.species,
                'breed': animal.breed,
                'age': animal.age,
                'gender': animal.gender,
                'color': animal.color or '',
                'size': animal.size or '',
                'health_status': animal.health_status,
                'vaccination_status': animal.vaccination_status or '',
                'sterilization_status': animal.sterilization_status or '',
                'status': animal.status.value,
                'created_at': animal.created_at.isoformat()
            })
        
        # 上傳到 MinIO
        csv_content = output.getvalue().encode('utf-8')
        filename = f"animals-export-{shelter_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
        
        # TODO: 實作 MinIO 上傳
        # file_url = minio_service.upload_file(
        #     file_content=csv_content,
        #     filename=filename,
        #     content_type='text/csv'
        # )
        
        # 暫時返回 CSV 內容 (實際應上傳到 MinIO)
        file_url = f"temp://{filename}"  # 臨時 URL
        
        # 更新 job 狀態
        job.status = JobStatus.SUCCEEDED
        job.completed_at = datetime.utcnow()
        job.result_summary = {
            'total_count': len(animals),
            'file_url': file_url,
            'filename': filename
        }
        db.session.commit()
        
        return {
            'success': True,
            'file_url': file_url,
            'count': len(animals)
        }
        
    except Exception as exc:
        job.status = JobStatus.FAILED
        job.completed_at = datetime.utcnow()
        job.result_summary = {
            'error': str(exc),
            'error_type': type(exc).__name__
        }
        db.session.commit()
        
        if self.request.retries < self.max_retries:
            countdown = 60 * (2 ** self.request.retries)
            raise self.retry(exc=exc, countdown=countdown)
        
        raise
