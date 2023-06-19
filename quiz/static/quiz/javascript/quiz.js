document.addEventListener('DOMContentLoaded', () => {

    sessionStorage.setItem('count', 0);

    const theme = document.querySelector('#heading-theme').dataset.theme;
    const theme_id = document.querySelector('#heading-theme').dataset.themeid;

    // Call the API with the category id to get quiz
    fetch(`https://opentdb.com/api.php?amount=10&category=${theme_id}`)
    .then(response => response.json())
    .then(data => {
        sessionStorage.setItem('quiz', JSON.stringify(data['results']));
    })

    // Enable the start button
    document.querySelector('#start-btn').onclick = () => {
        firstQuestion();
        document.querySelector('#start-btn').disabled = true;
    };
})


let count_interval;


function countdown(seconds) {

    // Set the countdown to 10s
    let chrono = document.querySelector('.second-countdown');
    chrono.innerHTML = seconds;

    // Launch the countdown bar animation
    bar = document.querySelector('.countdown-bar');
    bar.classList.remove("countdown-bar");
    bar.offsetWidth;
    bar.classList.add("countdown-bar");
    document.querySelector('.countdown-bar').style.animationPlayState = 'running';

    // Launch the countdown with set interval
    count_interval = setInterval(counter, 1000);
}


function counter() {
    
    // Get the time remaining from the countdown and decrease it
    let chrono = document.querySelector('.second-countdown');
    let countdown = chrono.innerHTML;
    countdown--;
    chrono.innerHTML = countdown;

    // If countdown reach 0, stop the interval
    if (countdown === 0) {
        clearInterval(count_interval);
        newQuestion('noanswerfromuser');
    }
}


function firstQuestion() {

    setTimeout( () => {
        // Get the first question of the quiz
        questions = JSON.parse(sessionStorage.getItem('quiz'));
        question = questions[0];

        // remove the start content and show the quiz content
        document.querySelector('#start-content').style.display = "none";
        document.querySelector('#during-content').style.display = "flex";

        // Check if the question is a boolean one
        if (question['type'] === 'boolean') {
            // Display Boolean section
            document.querySelector('#boolean-div').style.display = 'flex';
        }

        // Otherwise it's a mulitple answer question
        else {
            // Get a randomize number between 0 and 4 excluded for the true answer 
            let true_answer = getRandom(4);
            // Add the answers to buttons with the true answer at the randomized number
            let incorrect_answers = question['incorrect_answers'];
            let answers_count = 0;
            let incorrect_count = 0;
            document.querySelectorAll('.multi-btn-answer').forEach(button => {
                if (true_answer === answers_count) {
                    button.value = question['correct_answer'];
                    button.innerHTML = question['correct_answer'];
                    answers_count++;
                }
                else {
                    button.value = incorrect_answers[incorrect_count];
                    button.innerHTML = incorrect_answers[incorrect_count];
                    answers_count++;
                    incorrect_count++;
                }
            });
            // Display multiple section, changing the display style depending on the width of the screen
            let x = window.matchMedia("(max-width: 600px)");
            if (x.matches) {
                document.querySelector('#multiple-div').style.display = 'flex';
            }
            else {
                document.querySelector('#multiple-div').style.display = 'grid';
            }
        }

        // Update question
        document.querySelector('#quiz-difficulty').innerHTML = `difficulty: ${question['difficulty']}`;
        document.querySelector('#quiz-para').innerHTML = question['question'];

        // Add the countdown
        countdown(10);
        
    }, 700);

    // Add event listener to the answer buttons
    setTimeout( () => {
        document.querySelectorAll('.btn-answer').forEach(button => {
            button.onclick = () => {
                clearInterval(count_interval);
                document.querySelector('.countdown-bar').style.animationPlayState = 'paused';
                document.querySelectorAll('.btn-answer').disabled = true;
                newQuestion(button.value);
            }
        });
    }, 500);
}


function getCookie(name) {

    // Get the CSRF Token
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function getRandom(max) {
    return Math.floor(Math.random() * max);
}


function newQuestion(user_answer) {

    // Get the number round from actual question, and next questions and count from sessionStorage
    let questions = JSON.parse(sessionStorage.getItem('quiz'));
    let round = document.querySelector('#quiz-para').dataset.round;
    let count = sessionStorage.getItem('count');

    // Check if the answer is correct and update count
    if (user_answer === questions[round]['correct_answer']) {
        count++;
        sessionStorage.setItem('count', count);
    }

    // Change background of the correct answer 
    document.querySelectorAll('.btn-answer').forEach(button => {
        if (button.value === questions[round]['correct_answer']) {
            button.style.backgroundColor = 'MediumSeaGreen';
            button.style.borderColor = 'MediumSeaGreen';
            button.style.color = 'white';
        }
        if (user_answer === button.value && user_answer != questions[round]['correct_answer']) {
            button.style.backgroundColor = 'Crimson';
            button.style.color = 'white';
        }
    })

    setTimeout( () => {
        // Check if the quiz is over
        if (round == 9) {
            sendResult(count);
        }
        // Else display the next question
        else {
            round++;
        
            // Check if the next question is a boolean one
            if (questions[round]['type'] === 'boolean') {
                // Display Boolean section
                document.querySelector('#boolean-div').style.display = 'flex';
                document.querySelector('#multiple-div').style.display = 'none';
            }
        
            // Otherwise it's a mulitple answer question
            else {
                // Get a randomize number between 0 and 4 excluded for the true answer 
                let true_answer = getRandom(4);
                // Add the answers to buttons with the true answer at the randomized number
                let incorrect_answers = questions[round]['incorrect_answers'];
                let answers_count = 0;
                let incorrect_count = 0;
                document.querySelectorAll('.multi-btn-answer').forEach(button => {
                    if (true_answer === answers_count) {
                        button.value = questions[round]['correct_answer'];
                        button.innerHTML = questions[round]['correct_answer'];
                        answers_count++;
                    }
                    else {
                        button.value = incorrect_answers[incorrect_count];
                        button.innerHTML = incorrect_answers[incorrect_count];
                        answers_count++;
                        incorrect_count++;
                    }
                });
        
                // Display the multiple section
                document.querySelector('#boolean-div').style.display = 'none';
                let x = window.matchMedia("(max-width: 600px)");
                if (x.matches) {
                    document.querySelector('#multiple-div').style.display = 'flex';   
                }
                else {
                    document.querySelector('#multiple-div').style.display = 'grid'; 
                }
            }
        
            // Display question
            document.querySelector('#quiz-para').dataset.round = round;
            document.querySelector('#quiz-para').innerHTML = questions[round]['question'];
            document.querySelector('#quiz-difficulty').innerHTML = `difficulty: ${questions[round]['difficulty']}`;
            let display_round = round + 1;
            document.querySelector('#round-para').innerHTML = `Question ${display_round}/10`;

            // Enable the answers buttons
            document.querySelectorAll('.btn-answer').forEach(button => {
                button.style.backgroundColor = 'FloralWhite';
                button.style.borderColor = 'Crimson';
                button.style.color = 'Crimson';
                button.disabled = false;
            });

            // Add the countdown
            countdown(10);
        }
    }, 1000);
}


function sendResult(count) {

    // Remove the during content and show the end content
    document.querySelector('#during-content').style.display = 'none';
    document.querySelector('#end-content').style.display = 'flex';

    // Display the result to user
    document.querySelector('#score-para').innerHTML = `Quiz done! Your score: ${count}/10`;

    // Send result to backend
    const theme = document.querySelector('#heading-theme').dataset.theme;
    fetch(`/quiz/${theme}/result`, {
        method: 'POST',
        body: JSON.stringify({
            result: count,
        }),
        headers: {"X-CSRFToken": getCookie('csrftoken')},
        mode: 'same-origin', 
    })
}
