# CS50W Final Project - Quotes & Quizzes

  ![Quotes & Quizzes Logo](/quiz/static/quiz/images/logo.png)

## Website demo 

https://quotesandquizzes.eu.pythonanywhere.com/

## Purpose of the project

The aim was to create a web application enabling users to take quizzes in two categories, a quote category and a quiz category.   
The user can choose from the various themes proposed in each category and take a ten-question quiz, with ten seconds to answer each question.   
At the end of the quiz, and if the user is authenticated, their score is updated in the database. They can then go to their profile to view their scores by category or theme.   
User can also view the leaderboard, which displays cumulative scores by category and theme, and the ten users with the best average.

## Distinctiveness and Complexity

I choose to do a quiz webapp because in my opinion this project had a good balance between the backend part (with severals django models and mulitples views) and the frontend part (with a lot ot Javascript required for doing the quiz).   
I think my project respect the distinctiveness and complexity requirement because I tried to cover most of the notions we have seen in courses and projects to apply them to my own final project.

For the responsive design, I made it only using CSS with flexbox and grid, and media queries. I prefer it rather than use libraries like Bootstrap because it forces me to understand how to use CSS in order to make my webapp looks like I wanted.

Concerning the content of quizzes I choose to use three free API (credits in the next section), I had to deal with several endpoints, several ways of how the json was written and figured how to get the piece of data I was interested in.

I tried to put a lot of attention on the user journey, on what could not work as intented and how to prevent it. When using data from models, make sure that those data does exist otherwise display something else to the user, with check from Python files or html templates. For example when on the leaderboard page, there are a lot of check to see if the app should render the user score at the end of the table, in the table (because user is ranked), or nothing.

For the Django models, I used the possibility to define functions inside class in order to do more complex operations on models. For example for `UserScore` and `UserThemeScore` models, there are functions to calculate the average for a user, for all users and also make a user ranking regarding the best average. 

Concerning the quizzes, I used Javascript to add a lot of interactivity when user is doing a quiz. Rather than displaying all the questions at the same times with the backend, I display each new question once the previous one is answered, so there are a lot of DOM manipulation. To reinforce this feeling of interactivity, I added an animation bar synchronized with a chronometer countdown of 10s. This elements reset with the new question is displayed, either because user answered the previous question, or because the countdown drop to zero. 

## External resources used / Credits

In order to create the quizzes for my webapp, I used three free API from creators who deserve credit for the content of the quizzes:
- Open Trivia Database (https://opentdb.com/api_config.php)
- Shevabam (https://github.com/shevabam/breaking-bad-quotes)
- Shevabam (https://github.com/shevabam/game-of-thrones-quotes-api)

## Files description 

The description of the files is divided in several section, one for each type of files (Python, Html, Javascript...).

### Python files

**models.py**:
- `class UserScore(models.Model)`: A model for storing a user scores by category. It also contains function to calculate the average of a user (`def quote_average(self)` and `def quiz_average(self)`), but also a function to get average of score for all data for this model (`def overall()`). Finally it has also functions to return a list of top ten best user average for this model (`def quote_leaderboard()` and `def quiz_leaderboard()`).
- `class Theme(models.Model)`: A model for storing themes.
- `class QuoteAnswer(models.Model)`: A model for storing answers for quote themes.
- `class UserThemeScore(models.Model)`: A model for storing user scores by themes. It also contains function to calculate the average of a user (`def theme_average(self)`) and also a function to get the average of score for all data of a theme (`def theme_overall(theme)`). Also has a function to return a list of top ten best user average for a theme (`def theme_leaderboard(theme)`).

**urls.py**: Contains the different routes for the webapp, backend and api.

**views.py**:
- `def index(request)`: Function to render the homepage.
- `def leaderboard_view(request)`: Function to render the leaderboard page, with data from models.
- `def leaderboard_theme(request, theme)`: Function that is an api view, that return a Json response with data from models for a specific theme.
- `def login_view(request)`: Function to render the login page on get method, and log user in on post method and redirect to `def index(request)`.
- `def logout_view(request)`: Function to log out user and redirect to `def index(request)`.
- `def profile_view(request, name)`: Function that render the profile page, with data models from a specific user.
- `def quiz_result(request, theme)`: Function that is an api view post method, it receives data from json and does operations on data model for a user on a specific theme, if user is logged in, returning a Http response.
- `def quiz_view(request, theme)`: Function that returns the quiz page for a specific theme.
- `def quote_answer(request, theme)`: Function that is an api view to get data answer for a quote theme, returning data with Json response.
- `def quote_result(request, theme)`: Function that is an api view post method, it receives data from json and does operations on data model for a user on a specific theme, if user is logged in, returning a Http response.
- `def quote_view(request, theme)`: Function that returns the quiz page for a specific theme.
- `def random_theme(request)`: Function that redirect randomly to `def quiz_view(request, theme)` or `def quote_view(request, theme)`.
- `def register_view(theme)`: Function to render the register page on get method, and register a user on post method and redirect to `def index(request)`.
- `def setup(request)`: Function that can only be used by a super user when initializing the app for the first time. It will create data for Theme and QuoteAnswer models, thanks to json files.
- `def themes_view(request)`: Function that returns themes page with data from Theme model.

### Json files

**themes.json**: Contains dict themes, used to create data for the Theme model, when launching app for the first time.

**quoteanswers.json**: Contains dict theme answers, used to create data for the QuoteAnswer model, when launching app for the first time.

### Html files

**layout.html**: Contains the head, header and footer displayed for every page of the webapp.

**index.html**: The homepage of the webapp. It contains some links, credits and also a part beginning by `if user.is_superuser` with a button that let admin set up the database when it is launch locally for the first time (see how to run).

**register.html**: Contains a form to register to the webapp.

**login.hmtl**: Contains a form to log in to the webapp.

**themes.html**: Contains all the themes, separated in two categories, that user can click on to do a corresponding quiz.

**quote.html**: Contains three "parts", each one displayed at a specific moment. A start div `id="start-content"` displayed at the beggining with the button to start the quiz. A quiz div `id="during-content"` displayed during the quiz, that contains the question, the countdown (second and bar) and the answers. The content of this div is changed at each new question with Javascript. A end div `id="end-content"` displayed when the quiz is finish that display the score and links.

**quiz.html**: Contains the same three "parts" that **quote.html** explained above. The only difference is that it has two different div for the answers, one with multiple choice, and the other with a true/false answer.

**profile.html**: Contains a div that display tables with score overall data of the user for the two categories. Another div with buttons to display either all the quote themes data or the quiz themes data of the user. Finally two different div for the quote themes and quiz themes, that display tables with score overall data about the themes.

**leaderboard.html**: Contains multiple tables. First display a div with two buttons for categories and two dropdowns with the category themes. On click on the buttons, display, for the quote or the quiz category, the corresponding div with table of overall statistic, and table with the ten best users ranked. On click on a dropdown item, make an api call to backend to get data and display a div with table of overall statistic and table with the ten best users ranked, updated with the data using Javascript.

### CSS files

I won't describe CSS files, but just list them, because this files mostly contain use of grid and flexbox.

- **layout.css**
- **index.css**
- **authentication.css**
- **themes.css**
- **quiz.css**
- **profile.css**
- **leaderboard.css**

### Javascript Files

**quote.js**:
- This file is only loaded in **quote.hmtl**.
- `'DOMContentLoaded'`: Makes api call for data on backend, api call to external resources to get quote content and stores data in local storage. Then enables start button.
- `function countdown(seconds)`: Function called at each new question. Updates html element `.second-countdown` with a chrono of 10s and resets the countdown bar animation `.countdown-bar`. Calls `counter()` with a set interval of 1s.
- `function counter()`: Gets the innerHtml of the html element `.second-countdown`, and updates it with the innerHtml value minus one. If the new value is equal to zero, clear the interval launch in `counter()` and calls `newQuote` to launch the next question.
- `function firstQuote(theme)`: Gets data from local storage, create a a list for answers, and inserts in it the correct and the incorrects answers, in a random order. Then add the question and the answers to the corresponding html elements, displays the div for the quiz and calls `countdown(10)`. Finally adds on click event listener to the answer buttons that clear interval for countdown, stop animation, and call `newQuote(button.value)`.
- `function getCookie(name)`: Gets the CSRF token and returns it. 
- `function getRandom(max)`: Returns a random num. 
- `function newQuote(user_answer)`: Get data from local storage and html elements of previous question, checks if the answer is correct, if so updates the count and changes background color of answers to show user the correct / incorrect answer. Also checks if it was the last question, if so calls `sendResult(count)`. Otherwise, create new random list of answers and updates the html elements with the new question and answers and calls `countdown(10)`.
- `function sendResult(count)`: Displays the div that show ending content, updates the corresponding html elements and make an api call to send results to backend.

**quiz.js**:
- This file is only loaded in **quiz.html**.
- `'DOMContentLoaded'`: Makes api call to external resources to get quiz content and stores data in local storage. Then enables start button.
- `function countdown(seconds)`: Function called at each new question. Updates html element `.second-countdown` with a chrono of 10s and resets the countdown bar animation `.countdown-bar`. Calls `counter()` with a set interval of 1s.
- `function counter()`: Gets the innerHtml of the html element `.second-countdown`, and updates it with the innerHtml value minus one. If the new value is equal to zero, clear the interval launch in `counter()` and calls `newQuote` to launch the next question.
- `function firstQuestion()`: Get data from local storage, displays the div for the quiz, and checks if the type of answer are multiple choice or true/false, displaying the right one. For the multiple choice, adds in a random order the answers to the answer buttons. Finally adds data regarding question to html elements, calls `countdown(10)` and adds on click event listener to the answer buttons that clear interval for countdown, stop animation and call `newQuestion(button.value)`.
- `function getCookie(name)`: Gets the CSRF token and returns it. 
- `function getRandom(max)`: Returns a random num. 
- `function newQuestion(user_answer)`: Gets data from local storage and html elements of previous question, checks if the answer is correct, if so updates count and changes background color of answers to show user the correct / incorrect answer. Also checks if it was the last question, if so calls `sendResult(count)`. Otherwise, checks if the type of answer are multiple choice or true/false, displaying the right one. For the multiple choice, adds in a random order the answers to the answer buttons. Finally adds data regarding question to html elements and calls `countdown(10)`.
- `function sendResult(count)`: Displays the div that show ending content, updates the corresponding html elements and make an api call to send results to backend.

**score.js**:
- This file is loaded in **profile.html** and **leaderboard.html**.
- `'DOMContentLoaded'`: Checks if the file was loaded in the **profile.html** or **leaderboard.html**. For the first one, enables buttons to display theme score div. Adds on click event listener to headers of theme tables, that call `sortProfileTable(table_id, header_num)`. For the second one, enables buttons to display div category, calls `isFoot()` and enables on click event listener on dropdown item that call `themeLeaderboard(theme.innerHTML)`.
- `displayFoot(table_num)`: Function for **leaderboard.html**, get a specific table from html, then compares each row from table body with the row from footer, to see if the user is ranked, if they are similar, change style display of footer to none.
- `function getCookie(name)`: Gets the CSRF token and returns it.
- `function isFoot()`: Function for **leaderboard.html**, selects all `.leaderboard-table` element of html, then for each, checks if table has a footer, if so calls `displayFoot(table_num)`.
- `function sortProfileTable(table_id, header_num)`: Function for **profile.html**, gets a specific table and a specific column from this table. Compares each td with the next one to sort them by ascending order, and switch them if needed. If there was no switch, change to sort them by descending order.
- `function themeLeaderboard(theme)`: Function for **leaderboard.html**, gets data from backend for a specific theme, checks if there is data for this theme, otherwise displays div to show user there is not data. If there is data, displays the theme div, adds data to the element html (h2, overall table...), then checks if there are users ranked for the leaderboard table and adds there data or a message if no users ranked. Finally, if there is data for user, adds this data in the footer of the leaderboard table and calls `isFoot()`.

## How to run

To run the project you need to install libraries and packages listed in the file **requirements.txt**.  
You also had to add a secret key (`SECRET_KEY = 'yoursecretkey'`), and set the debug to true (`DEBUG = True`) in the file settings.py in the folder myproject, to run the project locally.

Like other Django project, you will have to run `python manage.py makemigrations quiz` and `python manage.py migrate` in order to create the database.  
Next you will have to run `python manage.py createsuperuser`, in order to create a super user.   
Finally run `python manage.py runserver` to run the project locally, log in with the super user account and when you will be on the index page, click on the button setup.   
This step is required in order to create the themes and answers for the models Theme and QuoteAnswer, you will only have to to it once (see the `def setup(request):` in Files description if you want to understand what this step does).