from django.urls import path

from . import views

app_name = 'quiz'
urlpatterns = [
    path('', views.index, name='index'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/<str:name>', views.profile_view, name='profile'),
    path('quiz/<str:theme>', views.quiz_view, name='quiz'),
    path('quote/<str:theme>', views.quote_view, name='quote'),
    path('random', views.random_theme, name='random'),
    path('register/', views.register_view, name='register'),
    path('setup/', views.setup, name='setup'),
    path('themes/', views.themes_view, name='themes'),

    # API Routes
    path('quiz/<str:theme>/result', views.quiz_result, name='quizresult'),
    path('quote/<str:theme>/answers', views.quote_answers, name='quoteanswers'),
    path('quote/<str:theme>/result', views.quote_result, name='quoteresult'),
    path('leaderboard/<str:theme>', views.leaderboard_theme, name='leaderboardtheme'),
]