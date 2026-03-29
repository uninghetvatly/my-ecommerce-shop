import json
from rest_framework import serializers
from .models import Product, ProductImage, Cart, CartItem, Review # <-- Thêm Review vào đây
from .models import Cart, CartItem
from django.db.models import Avg
from users.models import Shop
# 1. Tạo Serializer cho ảnh trước
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_thumbnail']

class ProductSerializer(serializers.ModelSerializer):
    # 2. Thêm dòng này để GỬI ảnh TỪ Django SANG React (Đọc dữ liệu)
    images = ProductImageSerializer(many=True, read_only=True)
    
    # Dòng này bạn đã có: Để NHẬN ảnh TỪ React VÀO Django (Ghi dữ liệu)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    shop_info = serializers.SerializerMethodField(read_only=True)
    average_rating = serializers.SerializerMethodField(read_only=True)
    review_count = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Product
        fields = '__all__' 
        read_only_fields = ['seller']
    def get_shop_info(self, obj):
        try:
            shop = Shop.objects.get(owner=obj.seller)
            return {
                "id": shop.id, # <--- BỔ SUNG DÒNG NÀY LÀ QUAN TRỌNG NHẤT
                "name": shop.shop_name,
                "joined_date": shop.created_at.strftime("%Y-%m-%d")
            }
        except Shop.DoesNotExist:
            return {"id": None, "name": obj.seller.username, "joined_date": obj.seller.date_joined.strftime("%Y-%m-%d")}

    def get_average_rating(self, obj):
        # Tính số sao trung bình từ bảng Review
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0

    def get_review_count(self, obj):
        return obj.reviews.count()
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        specs_data = self.context['request'].data.get('specs')
        if isinstance(specs_data, str):
            validated_data['specs'] = json.loads(specs_data)

        product = Product.objects.create(**validated_data)

        for image in uploaded_images:
            ProductImage.objects.create(product=product, image=image)

        return product
    
    
class CartItemSerializer(serializers.ModelSerializer):
    # DÒNG QUAN TRỌNG NHẤT: Lồng ProductSerializer vào đây 
    # để React lấy được ảnh, tên, giá chứ không chỉ lấy mỗi cái ID
    product = ProductSerializer(read_only=True) 

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'added_at']

# 2. Serializer cho Toàn bộ Giỏ hàng
class CartSerializer(serializers.ModelSerializer):
    # Lấy danh sách các item (Dùng related_name='items' mà bạn đã định nghĩa trong models.py)
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    # Trả về tên người dùng thay vì ID để React hiện thị đẹp
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']

from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    # Lồng product vào để có ảnh và tên
    product = ProductSerializer(read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'seller_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'shipping_address', 'phone_number', 
            'payment_method', 'payment_display', 'total_price', 
            'status', 'status_display', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['buyer', 'total_price', 'status']