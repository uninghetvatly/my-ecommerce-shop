from django.contrib import admin
from .models import Product, ProductImage

# This allows you to add images directly inside the Product creation page
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1 # Shows 1 empty image upload slot by default

# This customizes how Products look in the admin list
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'condition', 'created_at')
    list_filter = ('category', 'condition', 'is_active')
    search_fields = ('title', 'description')
    inlines = [ProductImageInline]

# Register your models here
admin.site.register(Product, ProductAdmin)