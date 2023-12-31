

const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCreateMeeting = document.getElementById('modalCreateMeeting');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalAgreeBtn = document.getElementById('modalAgreeBtn');
const createMeetBtn = document.getElementById('createMeetBtn');
const docDashboardLogout = document.getElementById('docDashboardLogout');
const modalCreateMeetForm = document.getElementById('modalCreateMeetForm');
const modalFormCloseBtn = document.getElementById('modalFormCloseBtn');
const modalFormCancelBtn = document.getElementById('modalFormCancelBtn');
const modalFormAgreeBtn = document.getElementById('modalFormAgreeBtn');
const modalForm = document.getElementById('modalForm');
const modalNameInput = document.getElementById('modalNameInput');
const modalDateInput = document.getElementById('modalDateInput');
const modalSelectTime = document.getElementById('modalSelectTime');
const modalSelectDoctor = document.getElementById('modalSelectDoctor');
const errorMessage = document.getElementById('errorMessage');


//Закрытие модального окна по нажатию на "крестик"
modalCloseBtn.addEventListener('click', () => {
    modalCreateMeeting.style.display = 'none';
});
//Закрытие модального окна по нажатию на "Cancel"
modalCancelBtn.addEventListener('click', () => {
    modalCreateMeeting.style.display = 'none';
});
//Открытие формы для создания встречи по нажатию на "Create meeting" в модальном окне и закрытие модального окна
modalAgreeBtn.addEventListener('click', () => {
    modalCreateMeeting.style.display = 'none';
    modalCreateMeetForm.style.display = 'flex';
});
//Открытие модального окна при нажатии на кнопку "Create meeting" на основной странице
createMeetBtn.addEventListener('click', () => {
    modalCreateMeeting.style.display = 'flex';
});
//Закрытие и обновление формы при нажатии на "крестик"
modalFormCloseBtn.addEventListener('click', () => {
    modalCreateMeetForm.style.display = 'none';
    modalForm.reset();
});
//Закрытие и обновление формы при нажатии на "Cancel"
modalFormCancelBtn.addEventListener('click', () => {
    modalCreateMeetForm.style.display = 'none';
    modalForm.reset();
});

//Здесь будет подтягиваться айдишник пациента из хранилища
let patientId = Number(getCookie("userID"));

//Функция, объединяющая функции для получения имени пациента и списка врачей в форму "Create meeting" по нажатию на кнопку "Create meeting" в модальном окне
async function form() {
    await getPatientName(patientId);
    await getDoctorsList()
}

//Подтягивание имени пациента и списка врачей в форму "Create meeting" по нажатию на кнопку "Create meeting" в модальном окне
modalAgreeBtn.addEventListener('click', form());

//Функция для получения с сервера имени залогиненого пациента и его подстановка в форму
async function getPatientName(thisPatientId) {
    await fetch('http://localhost:3000/patients?id=' + thisPatientId)
        .then((result) => { return result.json() })
        .then((data) => { modalNameInput.value = data[0].name })
        .catch((error) => console.log(error))
};

//Функция добавления докторов в select в форме
function selectDoctorListHTML(object) {
    let newOption = document.createElement('option');
    newOption.textContent = object.name;

    modalSelectDoctor.append(newOption);

}
//Функция получения докторов с сервера и их добавления в select в форме
async function getDoctorsList() {
    await fetch('http://localhost:3000/doctors')
        .then((result) => { return result.json() })
        .then((data) => { data.forEach(object => selectDoctorListHTML(object)) })
        .catch((error) => console.log(error))
}

let requestBtnsList = [];
//Функция для формирования таблицы приемов (Patient Queue)
function makeHtmlPatientQueue(object) {
    const table = document.getElementById('doctorDashbordTable');

    let newLine = document.createElement('tr');

    let newName = document.createElement('td');
    newName.textContent = object.doctor.name;
    newLine.append(newName);

    let newDate = document.createElement('td');
    newDate.textContent = object.date.slice(0, -10);
    newLine.append(newDate);

    let newEmail = document.createElement('td');
    newEmail.textContent = object.date.slice(-7);
    newLine.append(newEmail);

    let newOption = document.createElement('td');
    /*newOption.innerHTML = `<button class="doctor-dashbord__table_btn" id=${object.id}>Request Entry</button>`;*/
    let newButton = document.createElement('button');
    newButton.textContent = "Request Entry";
    newButton.classList.add("doctor-dashbord__table_btn");
    newButton.setAttribute("id", object.id);
    requestBtnsList.push(newButton);

    newOption.append(newButton);
    newLine.append(newOption);

    table.append(newLine);

}

//Функция для получения данных сервера о приемах и отображение в таблице Patient Queue
async function getMeetings() {
    await fetch('http://localhost:3000/meetings?_expand=doctor&patientId=' + patientId)
        .then((result) => { return result.json() })
        /*.then((data) => { console.log(data) })*/
        .then((data) => data.forEach(object => makeHtmlPatientQueue(object)))
        .catch((error) => console.log(error))

}


//Функция для выхода из профиля
function logout() {
    document.cookie = `userID=;expires=${new Date(0)}`;
    window.location.href = "login.html";
}
//Сохранение и изменение id доктора в куки при изменении селекта в форме
modalSelectDoctor.addEventListener("change", showID);
//Функция для получения id доктора по выбранному имени в форме
async function showID() {
    let doctorId = await fetch('http://localhost:3000/doctors?name=' + modalSelectDoctor.value)
        .then((result) => { return result.json() })
        .then((data) => { return data[0].id });
    console.log(doctorId);
    document.cookie = "doctorId=" + doctorId;
}
//Функция для получения значения куки по ключу
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


//Функция для валидации формы
modalDateInput.valueAsDate = new Date();
let now = new Date();
modalDateInput.setAttribute("min", now.getFullYear() + "-" + (now.getMonth() + 1) + "-0" + now.getDate())

function validateDate() {

    if (!modalDateInput.value) {
        errorMessage.textContent = "Please, chose the date";
        modalFormAgreeBtn.setAttribute("disabled", true)
    } else {
        console.log(modalDateInput.value)
        errorMessage.textContent = ""
        modalFormAgreeBtn.removeAttribute("disabled")
    }
}

modalDateInput.addEventListener('change', validateDate);


//Функция создания JSON для отправки на сервер инфо о новом приеме
function createMeeting() {
    let newMeeting = {
        date: modalDateInput.value + " - " + modalSelectTime.value,
        patientId: patientId,
        doctorId: Number(getCookie("doctorId")),
        meetLink: "https://meet.google.com/gfa-caog-gytr",
        requested: false
    };
    return newMeeting;

}

//Функция для отправки данных о новом приеме на сервер
async function addMeeting() {
    /*console.log(createMeeting());*/

    await fetch('http://localhost:3000/meetings',
        {
            method: 'POST',
            body: JSON.stringify(createMeeting()),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    )
        .then((result) => { return result.json() })
        .then((data) => { console.log(data) })
        .catch((error) => console.log(error))
}


//Слушатель события для добавления встречи на сервер
modalFormAgreeBtn.addEventListener('click', addMeeting);


//Слушатель для выхода из учетки
docDashboardLogout.addEventListener('click', logout);

//Загрузка встреч пациента при загрузке страницы
window.onload = getMeetings();






