/**
 * Survey Logic — Словарный запас и игровые методы
 */

// ============================================================
// CONFIGURATION — Replace with your Google Apps Script Web App URL
// ============================================================
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
// ============================================================

const TOTAL_STEPS = 10; // 0..9
let currentStep = 0;

const form = document.getElementById('surveyForm');
const steps = document.querySelectorAll('.step');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressWrapper = document.getElementById('progressWrapper');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnSubmit = document.getElementById('btnSubmit');
const navButtons = document.getElementById('navButtons');
const loadingOverlay = document.getElementById('loadingOverlay');

document.addEventListener('DOMContentLoaded', () => {
    updateNavButtons();
    updateProgress();
    initConditionalLogic();
});

// ===== Navigation =====
function nextStep() {
    if (currentStep < TOTAL_STEPS - 1) {
        if (!validateStep(currentStep)) return;
        animateStep(currentStep, currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 0) {
        animateStep(currentStep, currentStep - 1);
    }
}

function animateStep(from, to) {
    const fromEl = steps[from];
    fromEl.style.animation = 'fadeSlideOut 0.3s ease-in forwards';
    setTimeout(() => {
        fromEl.classList.remove('active');
        fromEl.style.animation = '';
        currentStep = to;
        steps[currentStep].classList.add('active');
        steps[currentStep].style.animation = 'fadeSlideIn 0.5s ease-out forwards';
        updateNavButtons();
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

function updateNavButtons() {
    const isWelcome = currentStep === 0;
    const isThankYou = currentStep === TOTAL_STEPS - 1;
    const isLast = currentStep === TOTAL_STEPS - 2;

    navButtons.style.display = (isWelcome || isThankYou) ? 'none' : 'flex';
    btnPrev.style.display = currentStep > 0 ? 'inline-flex' : 'none';
    btnNext.style.display = (!isLast && !isThankYou) ? 'inline-flex' : 'none';
    btnSubmit.style.display = isLast ? 'inline-flex' : 'none';
    progressWrapper.style.display = (isWelcome || isThankYou) ? 'none' : 'block';
}

function updateProgress() {
    const progress = (currentStep / (TOTAL_STEPS - 1)) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentStep} / ${TOTAL_STEPS - 1}`;
}

// ===== Validation =====
function validateStep(stepIdx) {
    const stepEl = steps[stepIdx];
    if (stepIdx === 0) return true; // welcome

    let valid = true;

    // Validate required radio groups
    stepEl.querySelectorAll('.radio-group[data-required="true"]').forEach(group => {
        const name = group.dataset.name;
        const block = group.closest('.question-block');
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
            showError(block, 'Выбери один из вариантов');
            valid = false;
        } else {
            hideError(block);
        }
    });

    // Validate required checkbox groups
    stepEl.querySelectorAll('.checkbox-group[data-required="true"]').forEach(group => {
        const name = group.dataset.name;
        const block = group.closest('.question-block');
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
            showError(block, 'Выбери хотя бы один вариант');
            valid = false;
        } else {
            hideError(block);
        }
    });

    // Validate required text/select/textarea inputs
    stepEl.querySelectorAll('input[data-required="true"], select[data-required="true"], textarea[data-required="true"]').forEach(input => {
        const block = input.closest('.question-block');
        if (!input.value.trim()) {
            showError(block, 'Заполни это поле');
            valid = false;
        } else {
            hideError(block);
        }
    });

    return valid;
}

function showError(block, msg) {
    block.classList.add('has-error');
    let errorEl = block.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        block.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}

function hideError(block) {
    block.classList.remove('has-error');
    const errorEl = block.querySelector('.error-message');
    if (errorEl) errorEl.remove();
}

// Clear errors on interaction
document.addEventListener('change', (e) => {
    if (e.target.type === 'radio' || e.target.type === 'checkbox') {
        const block = e.target.closest('.question-block');
        if (block) { block.classList.remove('has-error'); hideError(block); }
    }
});
document.addEventListener('input', (e) => {
    if (e.target.matches('input[data-required], select[data-required], textarea[data-required]')) {
        const block = e.target.closest('.question-block');
        if (block && e.target.value.trim()) { hideError(block); }
    }
});

// ===== Conditional Logic (Q17) =====
function initConditionalLogic() {
    const q17Radios = document.querySelectorAll('input[name="q17_ideas"]');
    const q17Block = document.getElementById('q17_conditional');
    q17Radios.forEach(r => {
        r.addEventListener('change', () => {
            q17Block.classList.toggle('show', r.value === 'Да' && r.checked);
        });
    });
}

// ===== Column Mapping =====
const COLUMN_MAP = {
    'q2_age': '2. Возраст',
    'q3_gender': '3. Пол',
    'q4_name': '4. Имя',
    'q5_russian': '5. Отношение к русскому языку',
    'q6_vocabulary': '6. Оценка словарного запаса',
    'q7_board_games': '7. Частота настольных игр',
    'q8_language_games': '8. Опыт языковых игр',
    'q9_interest': '9. Интерес к изучению через игры',
    'q10_likes': '10. Что нравится на уроках',
    'q10_other': '10. Другое (уточнение)',
    'q11_lesson': '11. Понравился ли урок с игрой',
    'q12_new_words': '12. Интерес к новым словам после игры',
    'q13_memorized': '13. Запоминание слов благодаря игре',
    'q14_rules': '14. Понимание правил игры',
    'q15_favorites': '15. Любимые моменты игры',
    'q16_changes': '16. Что изменить в игре',
    'q17_ideas': '17. Идеи для изучения слов',
    'q17_idea_text': '17. Описание идеи',
    'q18_comments': '18. Комментарии',
    'q19_antonym': '19. Антоним к «радостный»',
    'q20_climate': '20. Слова на тему «климат»',
    'q21_missing': '21. Пропущенное слово',
    'q22_meaning': '22. Значение «усердие»',
    'q23_proverb': '23. Пословица — выбор слова',
};

// ===== Data Collection =====
function collectFormData() {
    const raw = {};

    // Radios
    form.querySelectorAll('input[type="radio"]:checked').forEach(r => { raw[r.name] = r.value; });

    // Checkboxes
    const cbGroups = {};
    form.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        if (!cbGroups[cb.name]) cbGroups[cb.name] = [];
        cbGroups[cb.name].push(cb.value);
    });
    for (const [name, vals] of Object.entries(cbGroups)) { raw[name] = vals.join('; '); }

    // Text, textarea, select, number
    form.querySelectorAll('textarea, input.inline-text, input.text-input, select.select-input').forEach(el => {
        if (el.value.trim()) raw[el.name] = el.value.trim();
    });

    const data = {};
    data['№ ответа'] = '';
    data['Дата и время'] = new Date().toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    for (const [field, col] of Object.entries(COLUMN_MAP)) {
        data[col] = raw[field] || '';
    }
    return data;
}

// ===== Submission =====
async function submitForm() {
    if (!validateStep(currentStep)) return;

    const data = collectFormData();

    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.log('Survey data (script not configured):', data);
        showThankYou();
        return;
    }

    loadingOverlay.classList.add('show');
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        showThankYou();
    } catch (err) {
        console.error('Submission error:', err);
        alert('Произошла ошибка при отправке. Попробуй ещё раз.');
    } finally {
        loadingOverlay.classList.remove('show');
    }
}

function showThankYou() {
    const cur = steps[currentStep];
    cur.style.animation = 'fadeSlideOut 0.3s ease-in forwards';
    setTimeout(() => {
        cur.classList.remove('active');
        cur.style.animation = '';
        currentStep = TOTAL_STEPS - 1;
        steps[currentStep].classList.add('active');
        steps[currentStep].style.animation = 'fadeSlideIn 0.5s ease-out forwards';
        updateNavButtons();
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}
