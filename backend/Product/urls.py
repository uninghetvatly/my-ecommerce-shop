from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Tìm dòng import các views của bạn
from .views import ProductViewSet, get_cart, add_to_cart, remove_from_cart, product_reviews # <-- THÊM VÀO ĐÂY
from .views import OrderViewSet
# 1. Khởi tạo Router tự động cho Product (Nó sẽ tự tạo ra /products/)
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
# 2. Khai báo danh sách URL
urlpatterns = [
    # Nhúng các đường dẫn tự động của router vào (QUAN TRỌNG: Dòng này giúp lấy lại /api/products/)
    path('', include(router.urls)), 
    path('products/<int:product_id>/reviews/', product_reviews, name='product-reviews'),
    # 3 đường dẫn của Giỏ hàng
    path('cart/', get_cart, name='get-cart'),
    path('cart/add/', add_to_cart, name='add-to-cart'),
    path('cart/remove/<int:item_id>/', remove_from_cart, name='remove-from-cart'),
    path('', include(router.urls)),

]