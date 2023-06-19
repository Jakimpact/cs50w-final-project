from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Sum
import random

# Create your models here.

class User(AbstractUser):
    pass


class UserScore(models.Model):
    user= models.OneToOneField("User", on_delete=models.CASCADE)
    quote_score = models.PositiveIntegerField(default=0)
    quiz_score = models.PositiveIntegerField(default=0)
    total_quote = models.PositiveIntegerField(default=0)
    total_quiz = models.PositiveIntegerField(default=0)

    def quote_average(self):
        if self.total_quote == 0:
            return ("No score to display")
        else:
            average = self.quote_score / self.total_quote
            return {
                "user": self.user,
                "average": average,
                "score": self.quote_score,
                "total": self.total_quote
            }
    
    def quiz_average(self):
        if self.total_quiz == 0:
            return ("No score to display")
        else:
            average = self.quiz_score / self.total_quiz
            return {
                "user": self.user,
                "average": average,
                "score": self.quiz_score,
                "total": self.total_quiz
            }
        
    def overall():
        overall_quote_score = UserScore.objects.aggregate(sum=Sum("quote_score"))
        overall_total_quote = UserScore.objects.aggregate(sum=Sum("total_quote"))
        overall_quiz_score = UserScore.objects.aggregate(sum=Sum("quiz_score"))
        overall_total_quiz = UserScore.objects.aggregate(sum=Sum("total_quiz"))
        if overall_total_quote["sum"] != 0:
            overall_quote_average = overall_quote_score["sum"] / overall_total_quote["sum"]
        else:
            overall_quote_average = 0
        if overall_total_quiz["sum"] != 0:
            overall_quiz_average = overall_quiz_score["sum"] / overall_total_quiz["sum"]
        else:
            overall_quiz_average = 0   
        return {
            "overall_quote_score": overall_quote_score["sum"],
            "overall_total_quote": overall_total_quote["sum"],
            "overall_quiz_score": overall_quiz_score["sum"],
            "overall_total_quiz": overall_total_quiz["sum"],
            "overall_quote_average": overall_quote_average,
            "overall_quiz_average": overall_quiz_average,
        }
    
    def take_average(elem):
        return elem["average"]
    
    def quote_leaderboard():
        leaderboard_list = []
        users = UserScore.objects.filter(total_quote__gte=10).all()
        for user in users:
            leaderboard_list.append(UserScore.quote_average(user))
        leaderboard_list.sort(key=UserScore.take_average, reverse=True)
        if len(leaderboard_list) <= 10:
            return leaderboard_list
        else:
            return leaderboard_list[:10]

    def quiz_leaderboard():
        leaderboard_list = []
        users = UserScore.objects.filter(total_quiz__gte=10).all()
        for user in users:
            leaderboard_list.append(UserScore.quiz_average(user))
        leaderboard_list.sort(key=UserScore.take_average, reverse=True)
        if len(leaderboard_list) <=10:
            return leaderboard_list
        else:
            return leaderboard_list[:10]


class Theme(models.Model):
    name = models.CharField(max_length=60, unique=True)
    CATEGORIES_CHOICES = [
        ("quo", "Quote"),
        ("qui", "Quiz"),
    ]
    category = models.CharField(max_length=3, choices=CATEGORIES_CHOICES, null=True)
    quiz_id = models.PositiveIntegerField(null=True, blank=True, unique=True)

    def __str__(self):
        return (f"{self.get_category_display()}: {self.name}")
    
    def random_theme():
        themes = Theme.objects.all()
        random_num = random.randint(0, int(themes.count()) - 1)
        return themes[random_num]
    

class QuoteAnswer(models.Model):
    theme = models.ForeignKey("Theme", on_delete=models.CASCADE, related_name="theme_answers")
    answer = models.CharField(max_length=60)

    def __str__(self):
        return (f"{self.theme.name}: {self.answer}")
    
    def serialize(self):
        return {
            "answer": self.answer,
        }


class UserThemeScore(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_themes")
    theme = models.ForeignKey("Theme", on_delete=models.PROTECT)
    score = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "theme"], name="unique_user_theme")
        ]

    def __str__(self):
        return (f"{self.user} - {self.theme}")

    def theme_average(self):
        average = self.score / self.total
        return {
            "user": self.user.username,
            "average": average,
            "score": self.score,
            "total": self.total,
        }
        
    def theme_overall(theme):
        theme_overall = UserThemeScore.objects.filter(theme=theme).all()
        if theme_overall:
            score = theme_overall.aggregate(sum=Sum("score"))
            total = theme_overall.aggregate(sum=Sum("total"))
            average = score["sum"] / total["sum"]
            return {
                "theme": theme.name,
                "score": score["sum"],
                "total": total["sum"],
                "average": average,
            }
        else:
            return {
                "message": f"No quote/quiz done for {theme.name} theme.",
                "theme": theme.name,
            }
    
    def take_average(elem):
        return elem["average"]
    
    def theme_leaderboard(theme):
        leaderboard_list = []
        users = UserThemeScore.objects.filter(theme=theme).filter(total__gte=10).all()
        if users:
            for user in users:
                leaderboard_list.append(UserThemeScore.theme_average(user))
            leaderboard_list.sort(key=UserThemeScore.take_average, reverse=True)
            if len(leaderboard_list) <=10:
                return leaderboard_list
            else:
                return leaderboard_list[:10]
        else: 
            return {
                "message": f"No users ranked in {theme.name} theme.",
            }
