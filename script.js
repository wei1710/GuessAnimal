let currentNode;
let history = [];

function askQuestion(node) {
  if (node.question) {
    const answer = prompt(node.question + " (yes/no): ");
    if (answer === null) {
      return;
    }
    const trimmedAnswer = answer.toLowerCase().trim();
    if (node.question !== "Do you want to play again?") {
      history.push({ question: node.question, answer: trimmedAnswer });
    }
    if (trimmedAnswer === "yes") {
      if (node.yes) {
        askQuestion(node.yes);
      } else {
        playAgain();
      }
    } else if (trimmedAnswer === "no") {
      if (node.no) {
        askQuestion(node.no);
      } else {
        learnNewAnimal(node);
      }
    } else {
      console.log("Please answer with yes or no.");
      askQuestion(node);
    }
  }
}

function playAgain() {
  const answer = prompt("Do you want to play again? (yes/no): ");
  if (answer === null) {
    return;
  }
  const trimmedAnswer = answer.toLowerCase().trim();
  if (trimmedAnswer === "yes") {
    askQuestion(currentNode);
  } else if (trimmedAnswer === "no") {
    console.log("Final Tree State:");
    console.log(JSON.stringify(currentNode, null, 2));
    console.log("Game Over. Thanks for playing!");
    console.log("Full History:");
    console.log(JSON.stringify(history, null, 2));
    
    // Save JSON file
    saveJSONFile(currentNode);
  } else {
    console.log("Please answer with yes or no.");
    playAgain();
  }
}

function saveJSONFile(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  // Create a link element and click it to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.download = "tree.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function learnNewAnimal(parentNode) {
  const newAnimal = prompt("What animal were you thinking of? ");
  if (newAnimal === null) {
    return;
  }
  const trimmedNewAnimal = newAnimal.trim();
  const newQuestion = prompt(`Please provide a question that can distinguish between a ${parentNode.question} and a ${trimmedNewAnimal}: `);
  if (newQuestion === null) {
    return;
  }
  const trimmedNewQuestion = newQuestion.trim();
  history.push({ newAnimal: trimmedNewAnimal, newQuestion: trimmedNewQuestion });
  const newAnimalNode = {
    parent: null,
    question: trimmedNewAnimal,
    yes: null,
    no: null
  };
  const newQuestionNode = {
    parent: null,
    question: trimmedNewQuestion,
    yes: newAnimalNode,
    no: parentNode
  };

  if (parentNode === currentNode) {
    currentNode = newQuestionNode;
  } else {
    const parentParentNode = findParent(currentNode, parentNode);
    if (parentParentNode.yes === parentNode) {
      parentParentNode.yes = newQuestionNode;
    } else {
      parentParentNode.no = newQuestionNode;
    }
  }
  console.log("Thank you, I've learned something new!");
  playAgain();
}

function findParent(rootNode, targetNode) {
  if (!rootNode || (!rootNode.yes && !targetNode.no)) {
    return null;
  }
  if (rootNode.yes === targetNode || rootNode.no === targetNode) {
    return rootNode;
  }
  return findParent(rootNode.yes, targetNode) || findParent(rootNode.no, targetNode);
}

fetch("tree.json")
  .then(response => response.json())
  .then(data => {
    currentNode = data;
    askQuestion(currentNode);
  })
  .catch(error => {
    console.error("Error loading tree from file: ", error);
  });