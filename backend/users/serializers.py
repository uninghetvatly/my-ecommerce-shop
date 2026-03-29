from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Shop

# 1. Serializer cho Thông tin cá nhân
class UserProfileSerializer(serializers.ModelSerializer):
    # Kéo thêm email và ngày tham gia từ bảng User sang đây luôn cho gọn
    email = serializers.EmailField(source='user.email', read_only=True)
    joinedDate = serializers.DateTimeField(source='user.date_joined', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'full_name', 'avatar', 'gender', 'dob', 'phone', 'address', 'joinedDate']

# 2. Serializer cho Thông tin Shop
class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'owner', 'shop_name', 'shop_email', 'description', 'created_at']