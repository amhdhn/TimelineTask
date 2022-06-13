"use strict";

const addNewContainer = document.querySelector(".addNewContainer");
const addBtn = document.querySelector(".add");
const closeAddMenuBtn = document.querySelector(".closeAddNewTask");
const taskNameInput = document.querySelector(".taskNameInput");
const taskDescInput = document.querySelector(".taskDescInput");
const confirmAddBtn = document.querySelector(".confirmAddBtn");
const modalContainer = document.querySelector(".modalContainer");
const modalMsgElem = document.querySelector(".modalMsg");
const timeLineListElem = document.querySelector(".timeLineList");
const centerLineElem = document.querySelector(".centerLine");
const hourInput = document.querySelector(".hourInput");
const minuteInput = document.querySelector(".minuteInput");
const nightModeBtn = document.querySelector(".nightMode");


let modalTimeOutHandler;
let tasksData = {};
let selectedItemId = null;
let activeTask = null;

let currentTime = new Date();
let currentHour = currentTime.getHours();
let currentMin = currentTime.getMinutes();

let nightMode = false;

addBtn.addEventListener("click", toggleAddMenu);
addNewContainer.addEventListener("click", stopPropagationEvent);
closeAddMenuBtn.addEventListener("click", toggleAddMenu);
confirmAddBtn.addEventListener("click", checkAddMenuInputs);
hourInput.addEventListener("keyup", (event) => checkMaxInput(event, 23));
minuteInput.addEventListener("keyup", (event) => checkMaxInput(event, 59));
nightModeBtn.addEventListener("click", toggleNightMode);
window.addEventListener("load", loadTasksFromStorage);
window.addEventListener("load", loadNightModeFromStorage);


function loadTasksFromStorage() {

    let tasksArrayHolder = localStorage.tasks;
    activeTask = null;

    if (tasksArrayHolder) {
        tasksData = JSON.parse(tasksArrayHolder);

        if (Object.keys(tasksData).length > 0) {
            generateTasksList();
        } else {
            generateNoTaskMessage();
        }

    } else {
        generateNoTaskMessage();
    }
}

function generateTasksList() {
    centerLineElem.style.display = "block";
    removeAllChildElement(timeLineListElem);
    let listFragment = document.createDocumentFragment();
    let taskArray = Object.entries(tasksData);

    taskArray.forEach(task => {
        let timeLineItem = createDiv("timeLineItem");
        timeLineItem.dataset.id = task[0];

        let taskDot = createP("taskDot", "");

        let taskContentDiv = createDiv("taskContentDiv");

        let taskTitle = createP("taskTitle", task[1].name);

        let taskBody = createP("taskBody", task[1].desc);

        let hour = ('0' + task[1].hour).slice(-2);
        let min = ('0' + task[1].min).slice(-2);

        let taskTime = createP("taskTime", `${min} : ${hour}`);

        let controllDiv = createDiv("controllDiv");

        let taskEditBtn = createButton("taskEditBtn", "edit");
        taskEditBtn.addEventListener("click", () => {

            selectedItemId = timeLineItem.dataset.id;
            taskNameInput.value = tasksData[selectedItemId].name;
            taskDescInput.value = tasksData[selectedItemId].desc;
            minuteInput.value = tasksData[selectedItemId].min;
            hourInput.value = tasksData[selectedItemId].hour;
            toggleAddMenu();
        });

        let taskRemoveBtn = createButton("taskRemoveBtn", "delete");
        taskRemoveBtn.addEventListener("click", () => {
            selectedItemId = timeLineItem.dataset.id;
            deleteTask();
        });

        controllDiv.append(taskEditBtn, taskRemoveBtn);

        taskContentDiv.append(taskTitle, taskBody, taskTime, controllDiv);
        timeLineItem.append(taskDot, taskContentDiv)
        listFragment.appendChild(timeLineItem);

        isActiveTask(+task[1].hour, +task[1].min, timeLineItem);

    });
    timeLineListElem.appendChild(listFragment);
    scrollToActiveTask();
}

function generateNoTaskMessage() {
    removeAllChildElement(timeLineListElem);

    centerLineElem.style.display = "none";

    let noResultDiv = createDiv("noResultDiv");

    let noResultText = document.createElement("p");
    noResultText.classList.add("noResultText");
    noResultText.innerText = "There is no task, use + button to add new task";

    noResultDiv.appendChild(noResultText);

    timeLineListElem.appendChild(noResultDiv);
}

function removeAllChildElement(elem) {
    while (elem.hasChildNodes()) {
        elem.removeChild(elem.lastChild)
    }
}

function createDiv(className) {
    const div = document.createElement("div");
    div.classList.add(className);
    return div;
}

function createP(className, text) {
    const p = document.createElement("p");
    p.classList.add(className);
    p.innerText = text;
    return p;
}

function createButton(className, text) {
    let btn = document.createElement("button");
    btn.classList.add(className);
    btn.innerText = text;
    return btn
}

function toggleAddMenu(event) {

    if (addNewContainer.classList.contains("active")) {
        addNewContainer.classList.remove("active");
        selectedItemId = null;
        taskNameInput.value = "";
        taskDescInput.value = "";
        minuteInput.value = "";
        hourInput.value = "";
    } else {
        addNewContainer.classList.add("active");
    }
}

function deleteTask() {
    delete tasksData[selectedItemId];
    sortTasks();
    loadTasksFromStorage();
    selectedItemId = null;

}

function saveTaskToStorage() {
    localStorage.tasks = JSON.stringify(tasksData);
}

function sortTasks() {
    let arrayData = Object.entries(tasksData);

    let sortedArray = arrayData.sort((a, b) => {
        if (a[1].hour === b[1].hour) {
            return a[1].min - b[1].min;
        } else {
            return a[1].hour - b[1].hour;
        }
    });

    tasksData = {};

    sortedArray.map((item, index) => {
        tasksData[index + 1] = item[1];
    });

    saveTaskToStorage();
}

function isActiveTask(taskHour, taskMin, element) {
    if (!activeTask) {
        if (taskHour > currentHour || (taskHour === currentHour && taskMin >= currentMin)) {
            activeTask = element;
        }
    }
}

function scrollToActiveTask() {
    if (activeTask) {
        document.documentElement.scrollTop = activeTask.offsetTop - 20;
        activeTask.classList.add("activeTask");
    }
}

function stopPropagationEvent(event) {
    event.stopPropagation();
}

function checkAddMenuInputs() {

    let taskName = taskNameInput.value;
    let taskDesc = taskDescInput.value;
    let minValue = minuteInput.value;
    let hourValue = hourInput.value;
    if (taskName === "" || taskDesc === "" ||
        minValue === "" || hourValue === ""
    ) {
        showModal("Please fill all inputs.")
    } else {

        if (selectedItemId) {
            editTask(taskName, taskDesc, hourValue, minValue)
        } else {
            addNewTask(taskName, taskDesc, hourValue, minValue);
        }

        toggleAddMenu();
    }
}


function editTask(taskName, taskDesc, hourValue, minValue) {
    tasksData[selectedItemId].name = taskName;
    tasksData[selectedItemId].desc = taskDesc;
    tasksData[selectedItemId].min = minValue;
    tasksData[selectedItemId].hour = hourValue;
    selectedItemId = null;
    sortTasks();
    loadTasksFromStorage();
}


function checkMaxInput(event, max) {
    let inputValue = event.target.value;
    if (inputValue > max) {
        inputValue = max;
    }
    event.target.value = Math.floor(inputValue);
}

function addNewTask(taskName, taskDesc, hourValue, minValue) {
    let taskObject = {
        name: taskName,
        desc: taskDesc,
        hour: hourValue,
        min: minValue
    }
    let newId = Object.keys(tasksData).length + 1;
    tasksData[newId] = taskObject;
    sortTasks();
    loadTasksFromStorage();
}

function showModal(msg) {
    clearTimeout(modalTimeOutHandler);

    modalContainer.classList.add("active");
    modalMsgElem.innerText = msg;

    modalTimeOutHandler = setTimeout(() => {
        modalContainer.classList.remove("active");
    }, 3000);
}


function toggleNightMode() {
    if (nightMode) {
        nightMode = false;
    } else {
        nightMode = true;
    }
    saveNightModeToStorage();
    loadNightModeFromStorage();

}

function saveNightModeToStorage() {
    localStorage.nightMode = JSON.stringify(nightMode);
}

function loadNightModeFromStorage() {
    let nightModeInStorage = localStorage.nightMode;
    if (nightModeInStorage) {
        nightMode = JSON.parse(nightModeInStorage);
    }
    generateNightMode();
}

function generateNightMode() {
    let r = document.querySelector(':root');
    if (nightMode) {

        r.style.setProperty('--bgClr', '#121212');
        r.style.setProperty('--fade1BgClr', '#1212123a');
        r.style.setProperty('--fade2BgClr', '#12121200');
        r.style.setProperty('--taskBackClr', '#1a1a1a');
        r.style.setProperty('--darkTxtClr1', '#eee');
        r.style.setProperty('--darkTxtClr2', '#ccc');
        r.style.setProperty('--darkTxtClr3', '#aaa');
        r.style.setProperty('--btnClr', '#aaa');
        r.style.setProperty('--taskTitleClr', '#4e3e63');

    } else {
        r.style.setProperty('--bgClr', '#dddddd');
        r.style.setProperty('--fade1BgClr', '#dddddd3a');
        r.style.setProperty('--fade2BgClr', '#dddddd00');
        r.style.setProperty('--taskBackClr', '#3b3b3b');
        r.style.setProperty('--darkTxtClr1', '#000');
        r.style.setProperty('--darkTxtClr2', '#1f1f1f');
        r.style.setProperty('--darkTxtClr3', '#5a5a5a');
        r.style.setProperty('--btnClr', '#222');
        r.style.setProperty('--taskTitleClr', '#9c594d');
    }
}