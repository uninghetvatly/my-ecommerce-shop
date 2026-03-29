from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User # Assuming you link Shop to User for now

# If you have a separate Shop model already, import it here:
# from shops.models import Shop

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('phone', 'Điện thoại / Máy tính bảng'),
        ('laptop', 'Laptop / Máy tính xách tay'),
        ('pc', 'PC & Linh kiện máy tính'),
    ]

    CONDITION_CHOICES = [
        ('99', 'Như mới (99% - Không trầy xước)'),
        ('95', 'Tốt (95% - Trầy xước nhẹ)'),
        ('90', 'Khá (90% - Trầy xước nhiều, cấn móp)'),
        ('parts', 'Xác máy / Cần sửa chữa'),
    ]

    # 1. RELATIONSHIPS
    # Replace 'User' with 'Shop' if your Shop model is ready
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')

    # 2. BASIC INFO
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # We use BigIntegerField because VND prices can easily exceed standard Integer limits
    price = models.BigIntegerField() 
    original_new_price = models.BigIntegerField(null=True, blank=True) # For the "Tiết kiệm %" feature

    # 3. SPECIFICATIONS (Dynamic)
    # This stores the React 'specs' object (brand, cpu, ram, mainMem, etc.) neatly as JSON.
    specs = models.JSONField(default=dict, blank=True)

    # 4. HISTORY & CONDITION
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES)
    purchase_date = models.DateField(null=True, blank=True) # React input type="month" can be parsed to the 1st of the month
    description = models.TextField(blank=True, null=True)

    # 5. MEDIA
    # We store the video directly on the product
    video_proof = models.FileField(upload_to='products/videos/', null=True, blank=True)

    # 6. METADATA
    is_active = models.BooleanField(default=True) # To hide sold products without deleting them
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.price}₫"


# 7. MULTIPLE IMAGES HANDLING
# Because one product can have MANY images, we need a separate Many-to-One model for them
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/images/')
    is_thumbnail = models.BooleanField(default=False) # The primary image shown on the feed
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.title}"

# 8. CART & CART ITEM (MÔ HÌNH GIỎ HÀNG)
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Giỏ hàng của {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"
    
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xác nhận'),
        ('confirmed', 'Đã xác nhận'), # Thêm trạng thái này
        ('shipped', 'Đang giao hàng'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy')
    ]
    PAYMENT_CHOICES = [
        ('cod', 'Thanh toán khi nhận hàng (COD)'),
        ('banking', 'Chuyển khoản ngân hàng'),
    ]

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # --- THÔNG TIN GIAO HÀNG ---
    shipping_address = models.TextField(default="Chưa cung cấp")
    phone_number = models.CharField(max_length=20, default="Chưa cung cấp")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cod')
    
    total_price = models.BigIntegerField(default=0)
    status = models.CharField(max_length=20, default='pending', choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.buyer.username} - {self.get_status_display()}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shop_orders')
    quantity = models.PositiveIntegerField(default=1)
    price = models.BigIntegerField() # Giá tại thời điểm mua

    def __str__(self):
        return f"{self.quantity}x {self.product.title} (Order #{self.order.id})"

from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Đảm bảo mỗi user chỉ được đánh giá 1 sản phẩm 1 lần
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.product.title} - {self.rating} sao"    