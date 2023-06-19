import json
import html
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import User, UserScore, Theme, QuoteAnswer, UserThemeScore

# Create your views here.

def index(request):
    return render(request, "quiz/index.html")


@ensure_csrf_cookie
def leaderboard_view(request):
    user_score = 0
    # Check if user is authenticated and has score to display
    if request.user.is_authenticated:
        try:
            user_score = UserScore.objects.get(user=request.user)
        except UserScore.DoesNotExist:
            pass
    return render(request, "quiz/leaderboard.html", {
        "user_score": user_score,
        "overall": UserScore.overall(),
        "quote_themes": Theme.objects.filter(category="quo").all().order_by("name"),
        "quiz_themes": Theme.objects.filter(category="qui").all().order_by("name"),
        "quote_leaderboard": UserScore.quote_leaderboard(),
        "quiz_leaderboard": UserScore.quiz_leaderboard(),
    })


def leaderboard_theme(request, theme):
    # Check if the theme exists
    try:
        theme = html.unescape(theme)
        is_theme = Theme.objects.get(name=theme)
    except Theme.DoesNotExist:
        return HttpResponse(status=404)
    user_score = 0
    # Check if user is authenticated and has score for this theme
    if request.user.is_authenticated:
        try:
            user_score = UserThemeScore.objects.get(user=request.user, theme=is_theme).theme_average()
        except UserThemeScore.DoesNotExist:
            user_score = 1
    return JsonResponse({
        "user_score": user_score,
        "theme_overall": UserThemeScore.theme_overall(is_theme),
        "theme_leaderboard": UserThemeScore.theme_leaderboard(is_theme),
    }, status=200)     


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in 
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("quiz:index"))
        else: 
            return render(request, "quiz/login.html", {
                "message": "Invalid username and/or password"
            })
    else:
        return render(request, "quiz/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("quiz:index"))


def profile_view(request, name):
    # Check if the user exists
    try:
        user = User.objects.get(username=name)
    except User.DoesNotExist:
        return render(request, "quiz/index.html", {
            "message": f"{name} profile doesn't exist.",
        })
    # Check if user has a UserScore model
    try: 
        user_scores = UserScore.objects.get(user=user)
    except UserScore.DoesNotExist:
        return render(request, "quiz/index.html", {
            "message": f"{name} hasn't done any quiz for the moment.", 
        })
    # Create two lists for quotes and quiz themes scores
    quote_scores = []
    quiz_scores = []
    theme_scores = user.user_themes.all()
    for theme_score in theme_scores:
        if theme_score.theme.category == "quo":
            quote_scores.append(theme_score)
        elif theme_score.theme.category == "qui":
            quiz_scores.append(theme_score)
    return render(request, "quiz/profile.html", {
        "score": user_scores,
        "quote_scores": quote_scores,
        "quiz_scores": quiz_scores,
    })


def quiz_result(request, theme):
    if request.method == "POST":
        if request.user.is_authenticated:
            # Get data from Fetch
            data = json.loads(request.body)
            result = data.get("result")

            # Check if the theme if an existing one
            try:
                confirm_theme = Theme.objects.get(name=theme)
            except Theme.DoesNotExist:
                return HttpResponse(status=404)
            
            # Check if User already have a UserScore and update it
            try:
                user_score = UserScore.objects.get(user=request.user) 
                user_score.quiz_score += int(result)
                user_score.total_quiz += 1
                user_score.save()
            except UserScore.DoesNotExist:
                UserScore.objects.create(user=request.user, quiz_score=result, total_quiz=1)
            
            # Check if UserTheme already exists and update it
            try:
                user_theme = UserThemeScore.objects.get(user=request.user, theme=confirm_theme) 
                user_theme.score += int(result)
                user_theme.total += 1
                user_theme.save()
            except UserThemeScore.DoesNotExist:
                UserThemeScore.objects.create(user=request.user, theme=confirm_theme, score=result, total=1)                
            return HttpResponse(status=201)
        else:
            return HttpResponse(status=204)
    else:
        return HttpResponse(status=400)


@ensure_csrf_cookie
def quiz_view(request, theme): 
    # Check if the theme is an existing one
    try:
        quiz_theme = Theme.objects.get(name=theme)
    # If not return the themes html
    except Theme.DoesNotExist:
        return render(request, "quiz/themes.html", {
        "quotes": Theme.objects.filter(category="quo").all(),
        "quizzes": Theme.objects.filter(category="qui").all(),
        "message": f"The theme: {theme} doesn't exist."
        })
    if quiz_theme.category == 'quo':
        return render(request, "quiz/themes.html", {
        "quotes": Theme.objects.filter(category="quo").all(),
        "quizzes": Theme.objects.filter(category="qui").all(),
        "message": f"The theme: {theme} is not a theme from quiz category."
        })
    return render(request, "quiz/quiz.html", {
        "theme": quiz_theme,
    })


def quote_answers(request, theme):
    # Try to get the answers for a quote theme
    try:
        theme_answers = Theme.objects.get(name=theme).theme_answers.all()
    except Theme.DoesNotExist:
        return JsonResponse({
            "message": f"{theme} is not a valid theme",
        }, status=404)
    return JsonResponse([answer.serialize() for answer in theme_answers], safe=False)


def quote_result(request, theme):
    if request.method == "POST":
        if request.user.is_authenticated:
            # Get data from Fetch
            data = json.loads(request.body)
            result = data.get("result")

            # Check if the theme if an existing one
            try:
                confirm_theme = Theme.objects.get(name=theme)
            except Theme.DoesNotExist:
                return HttpResponse(status=404)
            
            # Check if User already have a UserScore and update it
            try:
                user_score = UserScore.objects.get(user=request.user) 
                user_score.quote_score += int(result)
                user_score.total_quote += 1
                user_score.save()
            except UserScore.DoesNotExist:
                UserScore.objects.create(user=request.user, quote_score=result, total_quote=1)
             
            # Check if UserTheme already exists and update it
            try:
                user_theme = UserThemeScore.objects.get(user=request.user, theme=confirm_theme) 
                user_theme.score += int(result)
                user_theme.total += 1
                user_theme.save()
            except UserThemeScore.DoesNotExist:
                UserThemeScore.objects.create(user=request.user, theme=confirm_theme, score=result, total=1)                
            return HttpResponse(status=201)
        else:
            return HttpResponse(status=204)
    else: 
        return HttpResponse(status=400)


@ensure_csrf_cookie
def quote_view(request, theme):
    # Check if the theme is an existing one
    try:
        quote_theme = Theme.objects.get(name=theme)
    # If not return the themes html
    except Theme.DoesNotExist:
        return render(request, "quiz/themes.html", {
        "quotes": Theme.objects.filter(category="quo").all(),
        "quizzes": Theme.objects.filter(category="qui").all(),
        "message": f"The theme: {theme} doesn't exist."
        })
    if quote_theme.category == 'qui':
        return render(request, "quiz/themes.html", {
        "quotes": Theme.objects.filter(category="quo").all(),
        "quizzes": Theme.objects.filter(category="qui").all(),
        "message": f"The theme: {theme} is not a theme from quote category."
        })
    return render(request, "quiz/quote.html", {
        "theme": quote_theme,
    })
    

def random_theme(request):
    # Return a random theme and call his quiz function
    theme = Theme.random_theme()
    if theme.category == "quo":
        return HttpResponseRedirect(reverse("quiz:quote", args=[theme.name]))
    elif theme.category == "qui":
        return HttpResponseRedirect(reverse("quiz:quiz", args=[theme.name]))


def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "quiz/register.html", {
                "message": "Passwords must match."
            })
        
        # Attempt to create a new user
        try:
            user = User.objects.create_user(username, '', password)
            user.save()
        except IntegrityError:
            return render(request, "quiz/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("quiz:index"))
    else:
        return render(request, "quiz/register.html")
    


def setup(request):
    # Check if the user is a superuser
    if request.user.is_superuser:
        # Check if the setup is already made
        try:
            is_theme = Theme.objects.get(name="Breaking Bad")
        except Theme.DoesNotExist:
            is_theme = False
        if is_theme:
            return render(request, "quiz/index.html", {
                "message": "database already setup."
            })
        # If setup isn't made
        else:
            # Get the themes from json file and create the Theme models
            themes_file = open("quiz/static/quiz/json/themes.json")
            themes = json.load(themes_file)
            for theme in themes:
                Theme.objects.create(name=themes[theme]['name'], category=themes[theme]['category'], quiz_id=themes[theme]['quiz_id'])
            # Get the quote answers for json file and create the QuoteAnswer models
            quoteanswers_file = open("quiz/static/quiz/json/quoteanswers.json")
            quoteanswers = json.load(quoteanswers_file)
            print(quoteanswers)
            for quoteanswer in quoteanswers:
                print(quoteanswers[quoteanswer])
                quote_theme = Theme.objects.get(name=quoteanswers[quoteanswer]['theme'])
                QuoteAnswer.objects.create(theme=quote_theme, answer=quoteanswers[quoteanswer]['answer'])
            # Create a UserScore
            UserScore.objects.create(user=request.user)
            return render(request, "quiz/index.html", {
                "message": "database successfuly setup."
            })
    else:
        return render(request, "quiz/index.html")
        

def themes_view(request):
    # Return lists of themes by category
    return render(request, "quiz/themes.html", {
        "quotes": Theme.objects.filter(category="quo").all().order_by("name"),
        "quizzes": Theme.objects.filter(category="qui").all().order_by("name"),
    })