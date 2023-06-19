document.addEventListener('DOMContentLoaded', function() {

    sessionStorage.setItem('count', 0);

    const theme = document.querySelector('#heading-theme').dataset.theme;

    // get the answer possibilites for the theme and store them in sessionStorage
    fetch(`/quote/${theme}/answers`, {
        headers: {"X-CSRFToken": getCookie('csrftoken')},
        mode: 'same-origin',
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.setItem('answers', JSON.stringify(data));
    })

    if (theme === "Breaking Bad") {
        // Call the API to get the quotes
        fetch('https://api.breakingbadquotes.xyz/v1/quotes/10')
        .then(response => response.json())
        .then(data => {
            // Store the quotes in sessionStorage
            sessionStorage.setItem('quotes', JSON.stringify(data)); 
        })
    }
    else if (theme === "Game of Thrones") {
        // Call the API to get the quotes
        fetch('https://api.gameofthronesquotes.xyz/v1/random/10')
        .then(response => response.json())
        .then(data => {
            // Store the quotes in sessionStorage
            sessionStorage.setItem('quotes', JSON.stringify(data)); 
        })
    }
    
    // Enable the start button
    document.querySelector('#start-btn').onclick = () => {
        firstQuote(theme);
        document.querySelector('#start-btn').disabled = true;        
    };
})


let count_interval;


function countdown(seconds) {
    
    // Set the counddown to 10s
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

    // Get the time remaining from the coundown and decrease it
    let chrono = document.querySelector('.second-countdown');
    let countdown = chrono.innerHTML;
    countdown--;
    chrono.innerHTML = countdown;

    // If countdown reach 0, stop the interval
    if (countdown === 0) {
        clearInterval(count_interval);
        newQuote('noanswerfromuser');
    }
}


function firstQuote(theme) {

    // Create the answers for the buttons
    setTimeout( () => {
        let quotes = JSON.parse(sessionStorage.getItem('quotes'));
        let answers = JSON.parse(sessionStorage.getItem('answers'));
        // Create an array for answers and randomly define the place of the true answer
        let randomized_answers = [];
        let true_answer = getRandom(4);
        // Push the true answer and the others in the array
        for (i = 0; i < 4; i++) {
            if (true_answer === i) {
                if (theme === "Breaking Bad") {
                    randomized_answers.push(quotes[0]["author"]);
                }
                else if (theme === "Game of Thrones") {
                    randomized_answers.push(quotes[0]["character"]["name"]);
                }
            }
            else {
                let random_answer = answers.splice(getRandom(answers.length), 1);
                // Check that the answer isn't the same that the true answer
                if (theme === "Breaking Bad") {
                    while (random_answer[0]["answer"] === quotes[0]["author"]) {
                        random_answer = answers.splice(getRandom(answers.length), 1);
                    }
                    randomized_answers.push(random_answer[0]["answer"]);
                }
                else if (theme === "Game of Thrones") {
                    while (random_answer[0]["answer"] === quotes[0]["character"]["name"]) {
                        random_answer = answers.splice(getRandom(answers.length), 1);
                    }
                    randomized_answers.push(random_answer[0]["answer"]);
                }
            }
        }
        
        // Display the first quote
        if (theme === "Breaking Bad") {
            document.querySelector('#quote-para').innerHTML = quotes[0]["quote"];
        }
        else if (theme === "Game of Thrones") {
            document.querySelector('#quote-para').innerHTML = quotes[0]["sentence"];
        }
        // Add randomized answers to buttons
        let answers_count = 0;
        document.querySelectorAll('.btn-answer').forEach(button => {
            button.value = randomized_answers[answers_count];
            button.innerHTML = randomized_answers[answers_count];
            answers_count++;
        });

        // remove the start content and show the quiz content
        document.querySelector('#start-content').style.display = "none";
        document.querySelector('#during-content').style.display = "flex";

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
                newQuote(button.value);
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


function newQuote(user_answer) {

    // Get the number round from actual quote, and the quotes and count from session storage
    let quotes = JSON.parse(sessionStorage.getItem('quotes'));
    let answers = JSON.parse(sessionStorage.getItem('answers'));
    let round = document.querySelector('#quote-para').dataset.round;
    let count = sessionStorage.getItem('count');
    const theme = document.querySelector('#heading-theme').dataset.theme;

    // Check the answer and if correct update count
    if (theme === "Breaking Bad") {
        if (user_answer === quotes[round]["author"]) {
            count++;
            sessionStorage.setItem('count', count);
        }
        // Change background of the correct answer
        document.querySelectorAll('.btn-answer').forEach(button => {
            if (button.value === quotes[round]["author"]) {
                button.style.backgroundColor = 'MediumSeaGreen';
                button.style.borderColor = 'MediumSeaGreen';
                button.style.color = 'white';
            }
            if (user_answer === button.value && user_answer != quotes[round]["author"]) {
                button.style.backgroundColor = 'Crimson';
                button.style.color = 'white';
            }
        })
    }
    else if (theme === "Game of Thrones") {
        if (user_answer === quotes[round]["character"]["name"]) {
            count++;
            sessionStorage.setItem('count', count);
        }
        // Change background of the correct answer
        document.querySelectorAll('.btn-answer').forEach(button => {
            if (button.value === quotes[round]["character"]["name"]) {
                button.style.backgroundColor = 'MediumSeaGreen';
                button.style.borderColor = 'MediumSeaGreen';
                button.style.color = 'white';
            }
            if (user_answer === button.value && user_answer != quotes[round]["character"]["name"]) {
                button.style.backgroundColor = 'Crimson';
                button.style.color = 'white';
            }
        })
    }

    setTimeout( () => {
        // Check if the quiz is over
        if (round == 9) {
            sendResult(count);
        }
        else {
            // Display the next quote with questions
            round++;
            let true_answer = getRandom(4);
            let randomized_answers = [];
    
            for (i = 0; i < 4; i++) {
                if (true_answer === i) {
                    if (theme === "Breaking Bad") {
                        randomized_answers.push(quotes[round]["author"]);                    
                    }
                    else if (theme === "Game of Thrones") {
                        randomized_answers.push(quotes[round]["character"]["name"]);                    
                    }
                }
                else {
                    let random_answer = answers.splice(getRandom(answers.length), 1);
                    if (theme === "Breaking Bad") {
                        while (random_answer[0]["answer"] === quotes[round]["author"]) {
                            random_answer = answers.splice(getRandom(answers.length), 1);
                        }
                        randomized_answers.push(random_answer[0]["answer"]);                    
                    }
                    else if (theme === "Game of Thrones") {
                        while (random_answer[0]["answer"] === quotes[round]["character"]["name"]) {
                            random_answer = answers.splice(getRandom(answers.length), 1);
                        }
                        randomized_answers.push(random_answer[0]["answer"]);                    
                    }
                }
            }
    
            let answers_count = 0;
            if (theme === "Breaking Bad") {
                document.querySelector('#quote-para').innerHTML = quotes[round]["quote"];
            }
            else if (theme === "Game of Thrones") {
                document.querySelector('#quote-para').innerHTML = quotes[round]["sentence"];            
            }
            document.querySelector('#quote-para').dataset.round = round;

            let display_round = round + 1;
            document.querySelector('#round-para').innerHTML = `Question ${display_round}/10`;

            document.querySelectorAll('.btn-answer').forEach(button => {
                button.value = randomized_answers[answers_count];
                button.innerHTML = randomized_answers[answers_count];
                answers_count++;
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
    document.querySelector('#score-para').innerHTML = `Quote quiz done! Your score: ${count}/10`;
    
    // Send result to backend
    const theme = document.querySelector('#heading-theme').dataset.theme;
    fetch(`/quote/${theme}/result`, {
        method: 'POST',
        body: JSON.stringify({
            result: count,
        }),
        headers: {"X-CSRFToken": getCookie('csrftoken')},
        mode: 'same-origin',
    })
}
