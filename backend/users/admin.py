from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Shop

# ==========================================
# 1. TÍCH HỢP PROFILE VÀO BẢNG USER MẶC ĐỊNH
# ==========================================

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Thông tin Cá nhân (Profile)'
    fk_name = 'user'

# Ghi đè (Override) trang quản lý User mặc định của Django
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    
    # Hiển thị thêm một vài cột thông tin ngoài danh sách User
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_phone')

    # Hàm phụ để lấy số điện thoại từ Profile hiển thị ra cột ngoài cùng
    def get_phone(self, instance):
        try:
            return instance.profile.phone
        except UserProfile.DoesNotExist:
            return ""
    get_phone.short_description = 'Số điện thoại'

# Hủy đăng ký User cũ và đăng ký lại User mới (đã độ thêm Profile)
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ==========================================
# 2. CẤU HÌNH TRANG QUẢN LÝ SHOP ĐỘC LẬP
# ==========================================

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    # Các cột hiển thị trên bảng danh sách
    list_display = ('shop_name', 'owner', 'shop_email', 'created_at')
    
    # Thanh tìm kiếm (Tìm theo tên shop, email hoặc username của chủ shop)
    search_fields = ('shop_name', 'shop_email', 'owner__username')
    
    # Bộ lọc bên tay phải
    list_filter = ('created_at',)
    
    # Sắp xếp mặc định (Shop mới tạo lên đầu)
    ordering = ('-created_at',)
    
    # Chỉ đọc trường created_at, không cho sửa thủ công
    readonly_fields = ('created_at',)