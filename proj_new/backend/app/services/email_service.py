"""
Email Service
發送各種類型的郵件（驗證、重置密碼等）
注意：目前僅記錄日誌，未實際發送郵件。生產環境需整合 SendGrid/SES
"""
from flask import current_app, url_for


class EmailService:
    """郵件服務"""
    
    @staticmethod
    def send_verification_email(user_email: str, username: str, token: str) -> bool:
        """
        發送 email 驗證郵件
        
        Args:
            user_email: 用戶郵箱
            username: 用戶名
            token: 驗證 token
        
        Returns:
            是否成功發送
        """
        try:
            # 構建驗證連結
            # 注意：在實際環境中，這應該是前端的 URL
            verify_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"
            
            # TODO: 實際發送郵件（整合 SendGrid/SES）
            # 目前僅記錄日誌
            message = f"""
========== EMAIL VERIFICATION ==========
To: {user_email}
Username: {username}
Subject: 驗證您的 Email 地址

驗證連結: {verify_url}

Token (for testing): {token}

此 token 24 小時內有效。
========================================
"""
            current_app.logger.warning(message)  # 使用 WARNING 確保顯示
            print(message)  # 也print 確保可見
            
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to send verification email to {user_email}: {e}")
            return False
    
    @staticmethod
    def send_password_reset_email(user_email: str, username: str, token: str) -> bool:
        """
        發送密碼重置郵件
        
        Args:
            user_email: 用戶郵箱
            username: 用戶名
            token: 重置 token
        
        Returns:
            是否成功發送
        """
        try:
            # 構建重置連結
            reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
            
            # TODO: 實際發送郵件
            current_app.logger.info(f"""
            ========== PASSWORD RESET ==========
            To: {user_email}
            Username: {username}
            Subject: 重置您的密碼
            
            重置連結: {reset_url}
            
            Token (for testing): {token}
            
            此 token 1 小時內有效。
            如果您沒有請求重置密碼，請忽略此郵件。
            ====================================
            """)
            
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to send password reset email to {user_email}: {e}")
            return False


# 創建單例
email_service = EmailService()
