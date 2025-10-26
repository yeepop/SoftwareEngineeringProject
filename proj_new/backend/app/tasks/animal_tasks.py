"""
Animal-related Celery Tasks
"""
import csv
import io
from datetime import datetime
from typing import Dict, Any

from app.celery import celery
from app import db
from app.models import Job, JobStatus, Animal, AnimalStatus, Shelter


@celery.task(bind=True, max_retries=3)
def process_animal_batch_import(self, job_id: int) -> Dict[str, Any]:
    """
    批次匯入動物資料
    
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
        file_url = job.payload.get('file_url')
        options = job.payload.get('options', {})
        
        # 驗證 shelter 存在
        shelter = Shelter.query.get(shelter_id)
        if not shelter:
            raise ValueError(f'Shelter {shelter_id} not found')
        
        # TODO: 從 MinIO 下載 CSV 檔案
        # file_url 格式: "animals-import/filename.csv"
        # file_content = minio_service.get_file_content(file_url)
        
        # 暫時使用假數據進行測試 (實際應從 MinIO 讀取)
        raise NotImplementedError('MinIO service not yet implemented. Please upload CSV directly via API.')
        
        # 解析 CSV
        csv_data = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_data))
        
        # 統計
        stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        # 批次處理
        batch_size = options.get('batch_size', 100)
        animals_to_add = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # 從第2行開始 (第1行是標題)
            stats['total'] += 1
            
            try:
                # 驗證必填欄位
                required_fields = ['name', 'species', 'breed', 'age', 'gender']
                missing_fields = [f for f in required_fields if not row.get(f)]
                
                if missing_fields:
                    raise ValueError(f'Missing required fields: {", ".join(missing_fields)}')
                
                # 建立動物物件
                animal = Animal(
                    shelter_id=shelter_id,
                    name=row['name'].strip(),
                    species=row['species'].strip(),
                    breed=row['breed'].strip(),
                    age=int(row['age']),
                    gender=row['gender'].strip(),
                    color=row.get('color', '').strip() or None,
                    size=row.get('size', '').strip() or None,
                    description=row.get('description', '').strip() or None,
                    health_status=row.get('health_status', '健康').strip(),
                    vaccination_status=row.get('vaccination_status', '').strip() or None,
                    sterilization_status=row.get('sterilization_status', '').strip() or None,
                    status=AnimalStatus.AVAILABLE,  # 預設為可領養
                    is_active=True
                )
                
                animals_to_add.append(animal)
                stats['success'] += 1
                
                # 批次新增
                if len(animals_to_add) >= batch_size:
                    db.session.bulk_save_objects(animals_to_add)
                    db.session.commit()
                    animals_to_add = []
                    
            except Exception as e:
                stats['failed'] += 1
                stats['errors'].append({
                    'row': row_num,
                    'data': row,
                    'error': str(e)
                })
                
                # 如果錯誤太多，提前終止
                if stats['failed'] > 100:
                    raise ValueError('Too many errors, aborting import')
        
        # 新增剩餘的動物
        if animals_to_add:
            db.session.bulk_save_objects(animals_to_add)
            db.session.commit()
        
        # 更新 job 狀態為成功
        job.status = JobStatus.SUCCEEDED
        job.completed_at = datetime.utcnow()
        job.result_summary = {
            'total_rows': stats['total'],
            'success_count': stats['success'],
            'failed_count': stats['failed'],
            'error_samples': stats['errors'][:10]  # 只保存前10個錯誤
        }
        db.session.commit()
        
        return stats
        
    except Exception as exc:
        # 更新 job 狀態為失敗
        job.status = JobStatus.FAILED
        job.completed_at = datetime.utcnow()
        job.result_summary = {
            'error': str(exc),
            'error_type': type(exc).__name__
        }
        db.session.commit()
        
        # 重試機制
        if self.request.retries < self.max_retries:
            # 指數退避: 60秒, 120秒, 240秒
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
