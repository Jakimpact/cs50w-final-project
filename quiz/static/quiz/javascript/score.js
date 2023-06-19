document.addEventListener('DOMContentLoaded', function() {

    let page = document.querySelector('#main-section').dataset.page;

    // For profile.html
    if (page === "profile") {

        // Enables buttons to display theme scores
        document.querySelectorAll('.profile-btn').forEach(button => {
            if (button.dataset.category === "quote") {
                button.onclick = () => {
                    document.querySelector('.quote-category').style.display = 'flex';
                    document.querySelector('.quiz-category').style.display = 'none';
                };
            }
            else if (button.dataset.category === "quiz") {
                button.onclick = () => {
                    document.querySelector('.quiz-category').style.display = 'flex';
                    document.querySelector('.quote-category').style.display = 'none';
                };
            }
        });
    
        // Enables click on headers of themes table to sort them
        let quote_table = document.querySelector('#quote-themes-table');
        let quiz_table = document.querySelector('#quiz-themes-table');
    
        var header_num = 0;
        quote_table.querySelectorAll('th').forEach(header => {
            header.dataset.num = header_num;
            header_num++;
            header.onclick = () => {
                sortProfileTable('#quote-themes-table', header.dataset.num);
            };
        });
    
        header_num = 0;
        quiz_table.querySelectorAll('th').forEach(header => {
            header.dataset.num = header_num;
            header_num++;
            header.onclick = () => {
                sortProfileTable('#quiz-themes-table', header.dataset.num);
            };
        });
    }

    // For leaderboard.html
    else if (page === "leaderboard") {

        // Enables buttons to display div
        document.querySelectorAll('.category-btn').forEach(button => {
            if (button.dataset.category === "quote") {
                button.onclick = () => {
                    document.querySelector('.quote-category').style.display = 'flex';
                    document.querySelector('.quiz-category').style.display = 'none';
                    document.querySelector('.theme-container').style.display = 'none';
                    document.querySelector('.empty-theme').style.display = 'none';
                };
            }
            else if (button.dataset.category === "quiz") {
                button.onclick = () => {
                    document.querySelector('.quote-category').style.display = 'none';
                    document.querySelector('.quiz-category').style.display = 'flex';
                    document.querySelector('.theme-container').style.display = 'none';
                    document.querySelector('.empty-theme').style.display = 'none';
                };
            };
        });

        // Check if tables has footer
        isFoot();

        // Enables onclick for the theme in dropdowns
        document.querySelectorAll('.theme').forEach(theme => {
            theme.onclick = () => {
                themeLeaderboard(theme.innerHTML);
            };
        });
    }
})


// For leaderboard.html, not display table foot of leaderboard tables if user is ranked
function displayFoot(table_num) {

    let leaderboard_table = document.querySelectorAll('.leaderboard-table')[table_num];
    let body_rows = leaderboard_table.children[1].rows;
    let foot_table = leaderboard_table.children[2];
    let foot_user = foot_table.rows[0].querySelectorAll('td')[0].innerHTML;

    for (let row = 0; row < body_rows.length; row++) {

        let body_user = body_rows[row].querySelectorAll('td')[0].dataset.username;

        if (body_user === foot_user) {
            foot_table.style.display = 'none';
            body_rows[row].style.fontWeight = 'bold';
            break;
        }
    }
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


// Check if the table has a footer
function isFoot() {

    var table_num = 0;

    document.querySelectorAll('.leaderboard-table').forEach(table => {
        let is_foot = table.children[2];
        if (is_foot != null) {
            displayFoot(table_num);
        }
        table_num++;
    })
}


// For profile.html, function to sort tables by clicking on headers
function sortProfileTable(table_id, header_num) {

    var rows, row, current_td, next_td, should_switch, switch_count = 0;
    var table = document.querySelector(table_id);
    var switching = true;
    var dir = "asc";

    while(switching) {

        switching = false;
        rows = table.rows;

        for (row = 1; row < (rows.length - 1); row++) {

            should_switch = false;
            current_td = rows[row].querySelectorAll('td')[header_num];
            next_td = rows[row + 1].querySelectorAll('td')[header_num];

            // Sort in ascending order
            if (dir === "asc") {

                // Sort by alphabet
                if (header_num == 0) {

                    if (current_td.getAttribute('value').toLowerCase() > next_td.getAttribute('value').toLowerCase()) {
                        should_switch = true;
                        break;
                    }
                }
                
                // Sort by number
                else {
                    
                    if (Number(current_td.getAttribute('value')) > Number(next_td.getAttribute('value'))) {
                        should_switch = true;
                        break;
                    }
                }
            }
            
            // Sort in descending order
            else if (dir === "desc") {
                
                // Sort by alphabet
                if (header_num == 0) {
                    
                    if (current_td.getAttribute('value').toLowerCase() < next_td.getAttribute('value').toLowerCase()) {
                        should_switch = true;
                        break;
                    }
                }
                
                // Sort by number
                else {
                    
                    if (Number(current_td.getAttribute('value')) < Number(next_td.getAttribute('value'))) {
                        should_switch = true;
                        break;
                    }
                }
            }
        }

        if (should_switch) {

            rows[row].parentNode.insertBefore(rows[row + 1], rows[row]);
            switching = true;
            switch_count++;
        }
        else {

            if (switch_count === 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}


// For leaderboard.html, function to get backend data from a specific theme
function themeLeaderboard(theme) {

    fetch(`/leaderboard/${theme}`, {
        headers: {"X-CSRFToken": getCookie('csrftoken')},
        mode: 'same-origin',
    })
    .then(response => response.json())
    .then(data => {
        let user_score = data["user_score"];
        let theme_overall = data["theme_overall"];
        let theme_leaderboard = data["theme_leaderboard"];
        
        // Check if there is no quiz done for the theme 
        if (theme_overall["message"]) {
            document.querySelector('.quote-category').style.display = 'none';
            document.querySelector('.quiz-category').style.display = 'none';
            document.querySelector('.theme-container').style.display = 'none';
            document.querySelector('.empty-theme').style.display = 'flex';
            document.querySelector('.empty-theme').innerHTML = `
            <h2>${theme_overall["theme"]} theme</h2>
            <p>${theme_overall["message"]}</p>
            `;
        }
        else {
            // Change the display of content-container
            document.querySelector('.quote-category').style.display = 'none';
            document.querySelector('.quiz-category').style.display = 'none';
            document.querySelector('.theme-container').style.display = 'flex';
            document.querySelector('.empty-theme').style.display = 'none';
            // Add the h2 and the overall table data
            document.querySelector('.overall-h2').innerHTML = `${theme_overall["theme"]} overall statistics`;
            let overall_table_tds = document.querySelector('#theme-overall-table').children[1].rows[0].querySelectorAll('td');
            overall_table_tds[0].innerHTML = `${theme_overall["total"]} done`;
            overall_table_tds[1].innerHTML = `${theme_overall["score"]} points`;
            overall_table_tds[2].innerHTML = `${theme_overall["average"].toFixed(2)} / 10`;

            // Add h2 leaderboard
            document.querySelector('.leaderboard-h2').innerHTML = `${theme_overall["theme"]} leaderboard`;
            // If the leaderboard is empty add a row to table with the message
            if (theme_leaderboard["message"]) {
                let leaderboard_tbody = document.querySelector('#theme-leaderboard-table').children[1];
                let tbody_row = document.createElement('tr');
                tbody_row.innerHTML = `<td colspan="4">${theme_leaderboard["message"]}</td>`;
                leaderboard_tbody.innerHTML = '';
                leaderboard_tbody.append(tbody_row);

                // Even if no users ranked, display user score if he has data in this theme
                // Check if user is not authenticated
                let leaderboard_table = document.querySelector('#theme-leaderboard-table');
                if (user_score === 0) {
                    if (leaderboard_table.children[2]) {
                        leaderboard_table.removeChild(leaderboard_table.children[2]);
                    }
                    leaderboard_table.nextElementSibling.innerHTML = '';
                }
                else {
                    // Check if user has do data for this theme
                    if (user_score === 1) {
                        if (leaderboard_table.children[2]) {
                            leaderboard_table.removeChild(leaderboard_table.children[2]);
                        }
                        leaderboard_table.nextElementSibling.innerHTML = 'You have done no quote/quiz in this theme.';
                    }
                    // Display the foot with user data for this theme
                    else {
                        if (leaderboard_table.children[2]) {
                            leaderboard_table.removeChild(leaderboard_table.children[2]);
                        }
                        leaderboard_table.nextElementSibling.innerHTML = '';
                        let leaderboard_tfoot = document.createElement('tfoot');
                        leaderboard_tfoot.innerHTML = `<tr>
                        <td>${user_score["user"]}</td>
                        <td>${user_score["total"]} done</td>
                        <td>${user_score["score"]} points</td>
                        <td>${user_score["average"].toFixed(2)} / 10</td>
                        </tr>`;
                        leaderboard_table.append(leaderboard_tfoot);
                    }
                }
            }
            // Add the rows with users ranked to table
            else {
                let leaderboard_tbody = document.querySelector('#theme-leaderboard-table').children[1];
                leaderboard_tbody.innerHTML = '';
                for (let rank = 0; rank < theme_leaderboard.length; rank++) {
                    let tbody_row = document.createElement('tr');
                    tbody_row.innerHTML = `
                    <td data-username="${theme_leaderboard[rank]["user"]}"><b>${rank + 1}</b> - ${theme_leaderboard[rank]["user"]}</td>
                    <td>${theme_leaderboard[rank]["total"]} done</td>
                    <td>${theme_leaderboard[rank]["score"]} points</td>
                    <td>${theme_leaderboard[rank]["average"].toFixed(2)} / 10</td>
                    `;
                    leaderboard_tbody.append(tbody_row);
                }

                // Check if user is not authenticated
                let leaderboard_table = document.querySelector('#theme-leaderboard-table');
                if (user_score === 0) {
                    if (leaderboard_table.children[2]) {
                        leaderboard_table.removeChild(leaderboard_table.children[2]);
                    }
                    leaderboard_table.nextElementSibling.innerHTML = '';
                }
                else {
                    // Check if user has do data for this theme
                    if (user_score === 1) {
                        if (leaderboard_table.children[2]) {
                            leaderboard_table.removeChild(leaderboard_table.children[2]);
                        }
                        leaderboard_table.nextElementSibling.innerHTML = 'You have done no quote/quiz in this theme.';
                    }
                    // Display the foot with user data for this theme
                    else {
                        if (leaderboard_table.children[2]) {
                            leaderboard_table.removeChild(leaderboard_table.children[2]);
                        }
                        leaderboard_table.nextElementSibling.innerHTML = '';
                        let leaderboard_tfoot = document.createElement('tfoot');
                        leaderboard_tfoot.innerHTML = `<tr>
                        <td>${user_score["user"]}</td>
                        <td>${user_score["total"]} done</td>
                        <td>${user_score["score"]} points</td>
                        <td>${user_score["average"].toFixed(2)} / 10</td>
                        </tr>`;
                        leaderboard_table.append(leaderboard_tfoot);
                        isFoot();
                    }
                }
            }
        }
    })
}
