from django.urls import path
# NHỚ IMPORT THÊM register_user Ở DÒNG NÀY:
from .views import my_profile, my_shop, register_user, public_shop_info

urlpatterns = [
    # API lấy thông tin Profile và Shop
    path('profile/', my_profile, name='my-profile'),
    path('shop/', my_shop, name='my-shop'),
    
    # API ĐĂNG KÝ MÀ BẠN ĐANG THIẾU:
    path('register/', register_user, name='register_user'),
    path('shop/<int:shop_id>/public/', public_shop_info, name='public_shop_info'),
]