from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import Product, Cart, CartItem
from .serializers import ProductSerializer, CartSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at') # Sắp xếp mới nhất lên đầu
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # ==========================================
    # CẬP NHẬT: Lọc sản phẩm cho ShopManagementPage
    # ==========================================
    def get_queryset(self):
        queryset = super().get_queryset()
        
        seller_param = self.request.query_params.get('seller')
        shop_id_param = self.request.query_params.get('shop_id')

        # Lọc cho trang "Shop của tôi"
        if seller_param == 'me' and self.request.user.is_authenticated:
            queryset = queryset.filter(seller=self.request.user)
            
        # Lọc cho trang "Xem Shop người khác"
        elif shop_id_param:
            queryset = queryset.filter(seller__shop__id=shop_id_param)
            
        return queryset

# ==========================================
# CÁC API DÀNH CHO GIỎ HÀNG (CẦN ĐĂNG NHẬP)
# ==========================================

# 1. API THÊM VÀO GIỎ HÀNG (POST)
@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Bắt buộc phải có Token
def add_to_cart(request):
    user = request.user # Lấy user từ Token, KHÔNG dùng id=1 nữa!

    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))

    try:
        product = Product.objects.get(id=product_id)
        # Lấy hoặc tạo giỏ hàng cho user
        cart, created = Cart.objects.get_or_create(user=user)
        
        # Kiểm tra xem sản phẩm đã có trong giỏ chưa
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
        
        if not item_created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
            
        cart_item.save()
        return Response({"message": "Đã thêm vào giỏ hàng"}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({"error": "Sản phẩm không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

# 2. API LẤY DANH SÁCH GIỎ HÀNG (GET)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    user = request.user 
    cart, created = Cart.objects.get_or_create(user=user)
    serializer = CartSerializer(cart)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 3. API XÓA SẢN PHẨM KHỎI GIỎ (DELETE)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
        item = CartItem.objects.get(id=item_id, cart=cart)
        item.delete()
        return Response({"message": "Đã xóa thành công"}, status=status.HTTP_204_NO_CONTENT)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({"error": "Sản phẩm không có trong giỏ"}, status=status.HTTP_404_NOT_FOUND)


from .models import Review
from .serializers import ReviewSerializer
from rest_framework.exceptions import ValidationError

@api_view(['GET', 'POST'])
def product_reviews(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Sản phẩm không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        reviews = product.reviews.all().order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({"error": "Vui lòng đăng nhập"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Kiểm tra xem user đã review chưa
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({"error": "Bạn đã đánh giá sản phẩm này rồi"}, status=status.HTTP_400_BAD_REQUEST)

        rating = int(request.data.get('rating', 5))
        comment = request.data.get('comment', '')

        review = Review.objects.create(
            product=product,
            user=request.user,
            rating=rating,
            comment=comment
        )
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
    # THÊM CÁC IMPORT NÀY LÊN ĐẦU FILE (Nếu chưa có)
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer

# THÊM CLASS NÀY VÀO CUỐI FILE
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = self.request.query_params.get('role', 'buyer')

        # 1. Nếu là người mua xem đơn hàng của họ (Trang CustomerOrdersPage)
        if role == 'buyer':
            return Order.objects.filter(buyer=user).order_by('-created_at')
        
        # 2. Nếu là người bán xem đơn hàng khách đặt (Trang ShopManagementPage)
        elif role == 'seller':
            # Tìm các đơn hàng mà trong đó CÓ SẢN PHẨM của seller này
            return Order.objects.filter(items__seller=user).distinct().order_by('-created_at')
        
        return Order.objects.none()

    @transaction.atomic # Đảm bảo giao dịch an toàn, lỗi là rollback
    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        # Lấy giỏ hàng hiện tại (hoặc có thể nhận list item_ids từ request nếu bạn muốn mua từng món)
        try:
            cart = Cart.objects.get(user=user)
            cart_items = cart.items.all()
        except Cart.DoesNotExist:
            return Response({"error": "Giỏ hàng trống!"}, status=status.HTTP_400_BAD_REQUEST)

        if not cart_items.exists():
            return Response({"error": "Không có sản phẩm để thanh toán!"}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo Order chính
        order = Order.objects.create(
            buyer=user,
            shipping_address=data.get('shipping_address', ''),
            phone_number=data.get('phone_number', ''),
            payment_method=data.get('payment_method', 'cod'),
            total_price=0 # Sẽ tính toán ở vòng lặp dưới
        )

        total_price = 0
        for item in cart_items:
            # Tạo OrderItem
            OrderItem.objects.create(
                order=order,
                product=item.product,
                seller=item.product.seller,
                quantity=item.quantity,
                price=item.product.price
            )
            total_price += item.product.price * item.quantity

        # Cập nhật tổng tiền
        order.total_price = total_price
        order.save()

        # XÓA TRẮNG GIỎ HÀNG SAU KHI ĐẶT THÀNH CÔNG
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Nâng cấp hàm update (PATCH) để thay đổi trạng thái đơn
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')
        role = request.query_params.get('role', 'buyer')

        # Người mua chỉ được quyền HỦY đơn khi đang ở trạng thái 'pending'
        if role == 'buyer' and new_status == 'cancelled':
            if instance.status != 'pending':
                return Response({"error": "Không thể hủy đơn hàng đã được xác nhận hoặc đang giao!"}, status=status.HTTP_400_BAD_REQUEST)
            instance.status = 'cancelled'
            instance.save()
            return Response({"message": "Đã hủy đơn hàng."})

        # Người bán được quyền chuyển trạng thái: pending -> confirmed -> shipped -> completed
        elif role == 'seller':
             if new_status in ['confirmed', 'shipped', 'completed', 'cancelled']:
                 instance.status = new_status
                 instance.save()
                 return Response({"message": f"Đã chuyển trạng thái thành: {instance.get_status_display()}"})

        return super().update(request, *args, **kwargs)