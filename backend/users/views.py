from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import UserProfile, Shop
from rest_framework import status
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    try:
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        data = {
            "name": profile.full_name or user.username,
            "email": user.email,
            "phone": profile.phone,
            "gender": profile.gender,
            "dob": profile.dob,
            "avatar": request.build_absolute_uri(profile.avatar.url) if profile.avatar else "https://github.com/shadcn.png",
            "joinedDate": user.date_joined
        }
        return Response(data)
    except User.DoesNotExist:
        return Response({"error": "Không tìm thấy user"}, status=404)

@api_view(['GET', 'PUT']) # THÊM 'PUT' VÀO ĐÂY
@permission_classes([IsAuthenticated])
def my_shop(request):
    shop, created = Shop.objects.get_or_create(
        owner=request.user,
        defaults={
            'shop_name': f"Shop của {request.user.username}",
            'shop_email': request.user.email,
            'description': "Chào mừng đến với cửa hàng của tôi!"
        }
    )
    
    # NẾU LÀ REQUEST CẬP NHẬT:
    if request.method == 'PUT':
        data = request.data
        shop.shop_name = data.get('name', shop.shop_name)
        shop.shop_email = data.get('email', shop.shop_email)
        shop.description = data.get('description', shop.description)
        shop.save()
        return Response({"message": "Cập nhật thành công!"}, status=status.HTTP_200_OK)

    # NẾU LÀ REQUEST LẤY THÔNG TIN:
    data = {
        "id": shop.id,
        "name": shop.shop_name,
        "email": shop.shop_email,
        "description": shop.description,
        "created_at": shop.created_at
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(['POST'])
def register_user(request):
    data = request.data
    try:
        # 1. Tạo User đăng nhập (Mặc định của Django)
        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password'),
            email=data.get('email')
        )
        
        # 2. Lưu luôn Thông tin cá nhân vào UserProfile
        UserProfile.objects.create(
            user=user,
            full_name=data.get('full_name', ''),
            phone=data.get('phone', ''),
            gender=data.get('gender', ''),
            dob=data.get('dob') if data.get('dob') else None,
            address=data.get('address', '')
        )
        
        return Response({"message": "Đăng ký thành công!"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def public_shop_info(request, shop_id):
    try:
        shop = Shop.objects.get(id=shop_id)
        data = {
            "id": shop.id,
            "name": shop.shop_name,
            "description": shop.description,
            "created_at": shop.created_at
        }
        return Response(data, status=status.HTTP_200_OK)
    except Shop.DoesNotExist:
        return Response({"error": "Shop không tồn tại"}, status=status.HTTP_404_NOT_FOUND)