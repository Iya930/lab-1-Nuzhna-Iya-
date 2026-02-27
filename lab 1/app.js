let shifts = [];
const STORAGE_KEY = 'lab1_shifts';

const form = document.getElementById('shiftForm');
const dateInput = document.getElementById('dateInput');
const timeSlotSelect = document.getElementById('timeSlotSelect');
const userNameInput = document.getElementById('userNameInput');
const commentInput = document.getElementById('commentInput');
const statusSelect = document.getElementById('statusSelect');
const tableBody = document.getElementById('tableBody');
const emptyMessage = document.getElementById('emptyMessage');
const resetBtn = document.getElementById('resetBtn');

function clearAllErrors() {
    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

function showError(inputElement, errorId, message) {
    inputElement.classList.add('invalid');
    document.getElementById(errorId).textContent = message;
}

function readFormData() {
    return {
        date: dateInput.value,
        timeSlot: timeSlotSelect.value,
        userName: userNameInput.value.trim(),
        comment: commentInput.value.trim(),
        status: statusSelect.value
    };
}

function validateForm(data) {
    clearAllErrors();
    let isValid = true;

    if (!data.date) {
        showError(dateInput, 'dateError', 'Оберіть дату');
        isValid = false;
    }

    if (!data.timeSlot) {
        showError(timeSlotSelect, 'timeSlotError', 'Оберіть зміну');
        isValid = false;
    }

    if (!data.userName) {
        showError(userNameInput, 'userNameError', 'Введіть ім\'я');
        isValid = false;
    } else if (data.userName.length < 3) {
        showError(userNameInput, 'userNameError', 'Мінімум 3 символи');
        isValid = false;
    }

    if (!data.status) {
        showError(statusSelect, 'statusError', 'Оберіть статус');
        isValid = false;
    }

    return isValid;
}

function generateId() {
    return shifts.length === 0 ? 1 : Math.max(...shifts.map(s => s.id)) + 1;
}

function addShift(data) {
    const newShift = {
        id: generateId(),
        date: data.date,
        timeSlot: data.timeSlot,
        userName: data.userName,
        comment: data.comment || '(без коментаря)',
        status: data.status
    };
    shifts.push(newShift);
    saveToStorage();
}

function deleteShift(id) {
    shifts = shifts.filter(s => s.id !== id);
    saveToStorage();
    renderTable();
}

function editShift(id) {
    const shift = shifts.find(s => s.id === id);
    if (shift) {
        dateInput.value = shift.date;
        timeSlotSelect.value = shift.timeSlot;
        userNameInput.value = shift.userName;
        commentInput.value = shift.comment === '(без коментаря)' ? '' : shift.comment;
        statusSelect.value = shift.status;
        deleteShift(id);
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            shifts = JSON.parse(data) || [];
        } catch {
            shifts = [];
        }
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
}

function renderTable() {
    if (shifts.length === 0) {
        tableBody.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');
    
    const rowsHtml = shifts.map((shift, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatDate(shift.date)}</td>
            <td>${shift.timeSlot}</td>
            <td>${shift.userName}</td>
            <td>${shift.status}</td>
            <td>${shift.comment}</td>
            <td>
                <button class="edit-btn" data-id="${shift.id}">Ред.</button>
                <button class="delete-btn" data-id="${shift.id}">Вид.</button>
            </td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rowsHtml;
}

function resetForm() {
    form.reset();
    clearAllErrors();
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function handleSubmit(event) {
    event.preventDefault();
    
    const formData = readFormData();
    if (!validateForm(formData)) return;
    
    addShift(formData);
    renderTable();
    resetForm();
}

function handleTableClick(event) {
    const target = event.target;
    
    if (target.classList.contains('delete-btn')) {
        const id = Number(target.dataset.id);
        if (confirm('Видалити чергування?')) {
            deleteShift(id);
        }
    }
    
    if (target.classList.contains('edit-btn')) {
        const id = Number(target.dataset.id);
        editShift(id);
    }
}

function initApp() {
    loadFromStorage();
    
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    renderTable();
    
    form.addEventListener('submit', handleSubmit);
    resetBtn.addEventListener('click', resetForm);
    tableBody.addEventListener('click', handleTableClick);
}

document.addEventListener('DOMContentLoaded', initApp);