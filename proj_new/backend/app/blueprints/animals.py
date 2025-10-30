"""
Animals Blueprint - 動物相關 API
"""
from flask import request, jsonify
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Animal, AnimalImage, User, AnimalStatus, Species, Sex
from datetime import datetime

animals_bp = Blueprint('animals', __name__, description='動物管理 API')


@animals_bp.route('', methods=['GET'])
def list_animals():
    """
    取得動物列表 (公開，支援搜尋與篩選)
    ---
    Query Parameters:
        - species: 物種 (CAT, DOG)
        - sex: 性別 (MALE, FEMALE, UNKNOWN)
        - status: 狀態 (DRAFT, SUBMITTED, PUBLISHED, RETIRED)
        - shelter_id: 收容所 ID
        - page: 頁碼 (預設 1)
        - per_page: 每頁筆數 (預設 20, 最大 100)
    """
    # 取得查詢參數
    species = request.args.get('species')
    sex = request.args.get('sex')
    status = request.args.get('status')
    shelter_id = request.args.get('shelter_id')
    owner_id = request.args.get('owner_id', type=int)
    q = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    # 建立查詢
    query = Animal.query.filter_by(deleted_at=None)
    
    # 如果有 owner_id 參數，查詢該用戶的所有動物(包含草稿)
    # 否則預設只顯示已發布的動物
    if owner_id:
        query = query.filter_by(owner_id=owner_id)
    else:
        # 預設只顯示已發布的動物
        if not status:
            status = AnimalStatus.PUBLISHED.value
    
    # 狀態篩選
    if status:
        try:
            query = query.filter_by(status=AnimalStatus(status))
        except ValueError:
            abort(400, message='無效的狀態值')
    
    # 篩選條件
    if species:
        try:
            query = query.filter_by(species=Species(species))
        except ValueError:
            abort(400, message='無效的物種值')
    
    if sex:
        try:
            query = query.filter_by(sex=Sex(sex))
        except ValueError:
            abort(400, message='無效的性別值')
    
    if shelter_id:
        query = query.filter_by(shelter_id=shelter_id)
    
    # 關鍵字搜尋
    if q:
        query = query.filter(
            db.or_(
                Animal.name.like(f'%{q}%'),
                Animal.description.like(f'%{q}%'),
                Animal.breed.like(f'%{q}%')
            )
        )
    
    # 分頁
    pagination = query.order_by(Animal.created_at.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return jsonify({
        'animals': [animal.to_dict(include_relations=True) for animal in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    }), 200


@animals_bp.route('/<int:animal_id>', methods=['GET'])
def get_animal(animal_id):
    """
    取得單一動物詳細資訊
    ---
    """
    animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
    
    if not animal:
        abort(404, message='動物不存在')
    
    # 只有已發布的動物或擁有者才能查看
    if animal.status != AnimalStatus.PUBLISHED:
        # 需要檢查是否為擁有者或管理員
        pass  # 這裡簡化處理
    
    return jsonify(animal.to_dict(include_relations=True)), 200


@animals_bp.route('', methods=['POST'])
@jwt_required()
def create_animal():
    """
    建立動物資料 (需登入)
    ---
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        abort(404, message='使用者不存在')
    
    data = request.get_json()
    
    # 建立動物
    animal = Animal(
        name=data.get('name'),
        species=Species(data['species']) if data.get('species') else None,
        breed=data.get('breed'),
        color=data.get('color'),
        sex=Sex(data['sex']) if data.get('sex') else None,
        dob=datetime.fromisoformat(data['dob']) if data.get('dob') else None,
        description=data.get('description'),
        status=AnimalStatus.DRAFT,  # 預設為草稿
        shelter_id=data.get('shelter_id'),
        owner_id=current_user_id,
        medical_summary=data.get('medical_summary'),
        created_by=current_user_id
    )
    
    db.session.add(animal)
    db.session.commit()
    
    return jsonify({
        'message': '動物資料建立成功',
        'animal': animal.to_dict(include_relations=True)
    }), 201


@animals_bp.route('/<int:animal_id>', methods=['PATCH'])
@jwt_required()
def update_animal(animal_id):
    """
    更新動物資料 (需為擁有者或管理員)
    ---
    問題6: 管理員不應該編輯已上架(PUBLISHED)的動物
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
    
    if not animal:
        abort(404, message='動物不存在')
    
    # 權限檢查 (問題6)
    from app.models.user import UserRole
    
    # 只有擁有者可以編輯自己的動物
    # 管理員不能編輯用戶傳來的送養資料
    if animal.owner_id != current_user_id:
        abort(403, message='只有動物擁有者可以修改此動物資料')
    
    data = request.get_json()
    
    # 更新欄位
    if 'name' in data:
        animal.name = data['name']
    if 'species' in data:
        animal.species = Species(data['species'])
    if 'breed' in data:
        animal.breed = data['breed']
    if 'color' in data:
        animal.color = data['color']
    if 'sex' in data:
        animal.sex = Sex(data['sex'])
    if 'dob' in data:
        animal.dob = datetime.fromisoformat(data['dob']) if data['dob'] else None
    if 'description' in data:
        animal.description = data['description']
    if 'status' in data:
        animal.status = AnimalStatus(data['status'])
    if 'medical_summary' in data:
        animal.medical_summary = data['medical_summary']
    
    db.session.commit()
    
    return jsonify({
        'message': '動物資料更新成功',
        'animal': animal.to_dict(include_relations=True)
    }), 200


@animals_bp.route('/<int:animal_id>', methods=['DELETE'])
@jwt_required()
def delete_animal(animal_id):
    """
    刪除動物資料 (軟刪除)
    ---
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
    
    if not animal:
        abort(404, message='動物不存在')
    
    # 檢查權限
    if animal.owner_id != current_user_id and not user.is_admin:
        abort(403, message='沒有權限刪除此動物資料')
    
    # 軟刪除
    animal.deleted_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': '動物資料已刪除'
    }), 200


# ========== 圖片管理 ==========

@animals_bp.route('/<int:animal_id>/images', methods=['POST'])
@jwt_required()
def add_animal_image(animal_id):
    """
    新增動物圖片
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
        if not animal:
            abort(404, message='動物不存在')
        
        # 權限檢查
        from app.models.user import UserRole
        if animal.owner_id != current_user_id and current_user.role != UserRole.ADMIN:
            abort(403, message='無權限管理此動物的圖片')
        
        data = request.get_json()
        
        # 驗證必填欄位
        if not data.get('image_url'):
            abort(400, message='缺少必填欄位: image_url')
        
        # 計算新圖片的順序
        max_order = db.session.query(db.func.max(AnimalImage.order)).filter_by(
            animal_id=animal_id
        ).scalar() or 0
        
        # 建立圖片記錄
        image = AnimalImage(
            animal_id=animal_id,
            storage_key=data.get('storage_key', ''),
            url=data['image_url'],
            mime_type=data.get('mime_type', 'image/jpeg'),
            order=max_order + 1
        )
        
        db.session.add(image)
        db.session.commit()
        
        return jsonify({
            'message': '圖片已新增',
            'image': image.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@animals_bp.route('/<int:animal_id>/images/<int:image_id>', methods=['DELETE'])
@jwt_required()
def delete_animal_image(animal_id, image_id):
    """
    刪除動物圖片
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
        if not animal:
            abort(404, message='動物不存在')
        
        # 權限檢查
        from app.models.user import UserRole
        if animal.owner_id != current_user_id and current_user.role != UserRole.ADMIN:
            abort(403, message='無權限管理此動物的圖片')
        
        image = AnimalImage.query.filter_by(
            animal_image_id=image_id,
            animal_id=animal_id
        ).first()
        
        if not image:
            abort(404, message='圖片不存在')
        
        # 可選: 從 MinIO 刪除實際檔案
        # if image.storage_key:
        #     try:
        #         minio_client.remove_object(Config.MINIO_BUCKET_NAME, image.storage_key)
        #     except Exception as e:
        #         current_app.logger.warning(f"Failed to delete file from MinIO: {e}")
        
        db.session.delete(image)
        db.session.commit()
        
        return jsonify({'message': '圖片已刪除'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@animals_bp.route('/<int:animal_id>/images/reorder', methods=['POST'])
@jwt_required()
def reorder_animal_images(animal_id):
    """
    重新排序動物圖片
    ---
    Body: { "image_orders": [{"image_id": 1, "order": 1}, ...] }
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
        if not animal:
            abort(404, message='動物不存在')
        
        # 權限檢查
        from app.models.user import UserRole
        if animal.owner_id != current_user_id and current_user.role != UserRole.ADMIN:
            abort(403, message='無權限管理此動物的圖片')
        
        data = request.get_json()
        image_orders = data.get('image_orders', [])
        
        # 更新圖片順序
        for item in image_orders:
            image = AnimalImage.query.filter_by(
                animal_image_id=item['image_id'],
                animal_id=animal_id
            ).first()
            if image:
                image.order = item['order']
        
        db.session.commit()
        
        return jsonify({'message': '圖片順序已更新'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== 狀態管理 ==========

@animals_bp.route('/<int:animal_id>/submit', methods=['POST'])
@jwt_required()
def submit_animal(animal_id):
    """
    提交動物供審核 (狀態: DRAFT -> SUBMITTED)
    ---
    擁有者可提交自己的動物
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
        if not animal:
            abort(404, message='動物不存在')
        
        # 權限檢查: 必須是擁有者
        if animal.owner_id != current_user_id:
            abort(403, message='只能提交自己的動物')
        
        # 狀態檢查
        if animal.status != AnimalStatus.DRAFT:
            abort(400, message=f'只能提交草稿狀態的動物,目前狀態: {animal.status.value}')
        
        # 更新狀態為待審核
        animal.status = AnimalStatus.SUBMITTED
        db.session.commit()
        
        return jsonify({
            'message': '動物已提交審核,管理員將儘快處理',
            'animal': animal.to_dict(include_relations=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@animals_bp.route('/<int:animal_id>/publish', methods=['POST'])
@jwt_required()
def publish_animal(animal_id):
    """
    發布動物 (狀態: DRAFT/SUBMITTED -> PUBLISHED)
    ---
    需要管理員權限
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        # 權限檢查
        from app.models.user import UserRole
        if current_user.role != UserRole.ADMIN:
            abort(403, message='需要管理員權限')
        
        animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
        if not animal:
            abort(404, message='動物不存在')
        
        if animal.status == AnimalStatus.PUBLISHED:
            abort(400, message='動物已經是發布狀態')
        
        animal.status = AnimalStatus.PUBLISHED
        db.session.commit()
        
        return jsonify({
            'message': '動物已發布',
            'animal': animal.to_dict(include_relations=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@animals_bp.route('/<int:animal_id>/retire', methods=['POST'])
@jwt_required()
def retire_animal(animal_id):
    """
    下架動物 (狀態: PUBLISHED -> RETIRED)
    ---
    需要管理員權限或擁有者
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
        if not animal:
            abort(404, message='動物不存在')
        
        # 權限檢查
        from app.models.user import UserRole
        if animal.owner_id != current_user_id and current_user.role != UserRole.ADMIN:
            abort(403, message='無權限下架此動物')
        
        if animal.status == AnimalStatus.RETIRED:
            abort(400, message='動物已經是下架狀態')
        
        animal.status = AnimalStatus.RETIRED
        db.session.commit()
        
        return jsonify({
            'message': '動物已下架',
            'animal': animal.to_dict(include_relations=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@animals_bp.route('/<int:animal_id>/reject', methods=['POST'])
@jwt_required()
def reject_animal(animal_id):
    """
    拒絕批准動物上架 (狀態: SUBMITTED -> DRAFT)
    ---
    需要管理員權限
    記錄拒絕原因、拒絕時間、拒絕者 (問題4、問題5)
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        # 權限檢查:只有管理員可以拒絕
        from app.models.user import UserRole
        if current_user.role != UserRole.ADMIN:
            abort(403, message='只有管理員可以拒絕批准')
        
        animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
        if not animal:
            abort(404, message='動物不存在')
        
        # 狀態檢查:只能拒絕待審核的動物
        if animal.status != AnimalStatus.SUBMITTED:
            abort(400, message=f'只能拒絕待審核狀態的動物,目前狀態: {animal.status.value}')
        
        # 取得拒絕原因
        data = request.get_json() or {}
        rejection_reason = data.get('rejection_reason', '').strip()
        
        if not rejection_reason:
            abort(400, message='請提供拒絕原因')
        
        # 更新狀態為草稿,記錄拒絕資訊
        animal.status = AnimalStatus.DRAFT
        animal.rejection_reason = rejection_reason
        animal.rejected_at = datetime.utcnow()
        animal.rejected_by = current_user_id
        
        db.session.commit()
        
        # TODO: 發送通知給動物擁有者
        
        return jsonify({
            'message': '已拒絕批准,動物狀態改為草稿',
            'animal': animal.to_dict(include_relations=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
