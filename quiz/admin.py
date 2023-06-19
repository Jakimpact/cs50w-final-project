from django.contrib import admin
from .models import User, UserScore, Theme, QuoteAnswer, UserThemeScore

# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username')

class UserScoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'quote_score', 'quiz_score', 'total_quote', 'total_quiz')

class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'quiz_id')

class QuoteAnswerAdmin(admin.ModelAdmin):
    list_display = ('theme', 'answer')

class UserThemeScoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'score', 'total')

admin.site.register(User, UserAdmin)
admin.site.register(UserScore, UserScoreAdmin)
admin.site.register(Theme, ThemeAdmin)
admin.site.register(QuoteAnswer, QuoteAnswerAdmin)
admin.site.register(UserThemeScore, UserThemeScoreAdmin)
