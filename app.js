var currentQuestionIndex = 0;
var answerSelected = false;  // Variable, um zu überprüfen, ob bereits eine Antwort ausgewählt wurde
var questions = getDefaultQuestions();

function loadScoresFromLocalStorage() {
    correctAnswers = parseInt(localStorage.getItem('correctAnswers')) || 0;
    incorrectAnswers = parseInt(localStorage.getItem('incorrectAnswers')) || 0;
}

function getDefaultQuestions() {
    // Definiere hier die Standardfragen
    var questions = [
    {
      prompt: "Was ist die Hauptstadt von Frankreich?",
      options: ["Berlin", "London", "Paris"],
      correctAnswer: "Paris",
      frequency: 1
    },
    {
      prompt: "Wie viele Kontinente gibt es?",
      options: ["5", "6", "7"],
      correctAnswer: "7",
      frequency: 1
    },
    {
      prompt: "Wer schrieb 'Romeo und Julia'?",
      options: ["William Shakespeare", "Charles Dickens", "Jane Austen"],
      correctAnswer: "William Shakespeare",
      frequency: 1
    },
  
      // Füge hier weitere Standardfragen hinzu
    ];
  
    return questions;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function loadQuestions() {
    var questions = JSON.parse(localStorage.getItem('questions')) || getDefaultQuestions();

}
// Laden der Fragen beim Start
loadQuestions();
function saveQuestions() {
    localStorage.setItem('questions', JSON.stringify(questions));
}
function displayQuestion() {
  var question = questions[currentQuestionIndex];
  document.getElementById('question-prompt').innerText = question.prompt;

  var optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';

    // Mischen der Optionen
    shuffleArray(question.options);

  question.options.forEach(function (option, index) {
    var button = document.createElement('button');
    button.innerText = option;
    button.onclick = function () {
      if (!answerSelected) {
        checkAnswer(option);
      }
    };
    optionsContainer.appendChild(button);
  });

  document.getElementById('result-message').innerText = "";
  document.querySelectorAll('.options-container button').forEach(function (button) {
    button.classList.remove('correct-answer', 'incorrect-answer');
  });

  // Disable the next button until an answer is selected
  document.getElementById('next-button').disabled = true;
}
function getRandomQuestionIndex() {
    var totalFrequency = questions.reduce((total, question) => total + question.frequency, 0);
    var randomPoint = Math.random() * totalFrequency;

    var currentIndex = 0;
    for (let i = 0; i < questions.length; i++) {
        if (randomPoint < questions[i].frequency) {
            return i;
        }
        randomPoint -= questions[i].frequency;
    }

    return questions.length - 1;
}
function checkAnswer(selectedOption) {
    var question = questions[currentQuestionIndex];
    var buttons = document.querySelectorAll('#options-container button');
    
    answerSelected = true;

    buttons.forEach(function (button) {
        if (button.innerText === question.correctAnswer) {
            button.classList.add('correct-answer');
        } else if (button.innerText === selectedOption) {
            button.classList.add('incorrect-answer');
        }

        button.disabled = true;
    });

    if (selectedOption === question.correctAnswer) {
        correctAnswers++;
        localStorage.setItem('correctAnswers', correctAnswers);
        question.frequency = Math.max(0, question.frequency - 1);
    } else {
        incorrectAnswers++;
        localStorage.setItem('incorrectAnswers', incorrectAnswers);
        question.frequency = question.frequency === null ? 1 : question.frequency + 1;
    }

    saveQuestions();  // Speichere die aktualisierten Fragen

    updateScoreDisplay();
    // Enable the next button once an answer is selected
    document.getElementById('next-button').disabled = false;
}
function updateScoreDisplay() {
  document.getElementById('score-display').innerText = "Richtig: " + correctAnswers + " | Falsch: " + incorrectAnswers;
}
function nextQuestion() {
    // Überprüfen, ob alle Fragen eine Frequenz von 0 haben
    if (questions.every(question => question.frequency === 0)) {
        document.getElementById('quiz-container').innerHTML = "Spiel beendet!";
        return;
    }

    currentQuestionIndex = getRandomQuestionIndex();

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        document.getElementById('quiz-container').innerHTML = "Quiz beendet!";
    }

    answerSelected = false;
}



  // Exportiere die Standardfragen
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = defaultQuestions;
  }

    document.getElementById('export-button').addEventListener('click', function() {
    var csvContent = 'data:text/csv;charset=utf-8,Frage;Antwort1;Antwort2;Antwort3;Ergebnis\r\n';
    questions.forEach(function(question) {
        var row = [question.prompt].concat(question.options).join(';') + ';' + question.correctAnswer;
        csvContent += row + '\r\n';
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'questions.csv');
    document.body.appendChild(link);
    link.click();
    });

    document.getElementById('import-button').addEventListener('click', function() {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) {
            alert('Keine Datei ausgewählt!');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            var lines = contents.split('\n').filter(function(line) {
                // Remove empty lines
                return line.trim() !== '';
            });
            try {
                // Skip the title line
                questions = lines.slice(1).map(function(line) {
                    var parts = line.split(';');
                    if (parts.length < 5) {
                        throw new Error('Ungültiges Format!');
                    }
                    return {
                        prompt: parts[0],
                        options: parts.slice(1, 4),
                        correctAnswer: parts[4].trim(),
                        frequency: 1
                    };
                });
                localStorage.setItem('questions', JSON.stringify(questions));
            } catch (error) {
                alert(error.message);
            }
        };
        reader.onerror = function() {
            alert('Fehler beim Lesen der Datei!');
        };
        reader.readAsText(file);
    });

    document.getElementById('show-text-button').addEventListener('click', function() {
        var textContainer = document.getElementById('text-container');
        if (textContainer.style.display === 'none') {
            textContainer.style.display = 'block';
        } else {
            textContainer.style.display = 'none';
        }
    });

    document.getElementById('copy-button').addEventListener('click', function() {
        var text = "Erstelle mir einen CSV Text mit folgendem Aufbau und fülle diesen mit X Fragen zu dem Thema Y    Frage;Antwort1;Antwort2;Antwort3;Ergebnis"
        navigator.clipboard.writeText(text).then(function() {
            // Open the link after the text is copied
            window.open('https://chat.openai.com', '_blank');
        }).catch(function(error) {
            alert('Fehler beim Kopieren des Textes: ' + error);
        });
    });

    document.getElementById('next-button').addEventListener('click', nextQuestion);

    function addAdvancedButtonListener() {
        document.getElementById('advanced-button').addEventListener('click', function() {
            toggleVisibility('export-button');
            toggleVisibility('import-button');
            toggleVisibility('show-text-button');
        });
    }

    function initialize() {
        loadScoresFromLocalStorage();
        displayQuestion();
        updateScoreDisplay();
    }

    function toggleVisibility(elementId) {
        var element = document.getElementById(elementId);
        if (element.style.display === "none") {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }

document.addEventListener('DOMContentLoaded', function() {
    initialize();
    addAdvancedButtonListener();
});

function selectAnswer(index) {
    var buttons = document.querySelectorAll('#options-container button');
    if (buttons[index]) {
        buttons[index].click();
    }
}

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case '1':
            // Erste Antwort auswählen
            selectAnswer(0);
            break;
        case '2':
            // Zweite Antwort auswählen
            selectAnswer(1);
            break;
        case '3':
            // Dritte Antwort auswählen
            selectAnswer(2);
            break;
        case ' ':
        case 'Spacebar': // für ältere Browser
            event.preventDefault();
            nextQuestion();
            break;
    }
});