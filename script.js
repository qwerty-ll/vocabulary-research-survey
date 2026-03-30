/**
 * Survey Logic — single-page form
 */

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzf8eGqgUe53cybIuOgp21bSg45ov2fYbA6Eu3F4wXhzr0FGm30si2kMIixSqZ3ufzE/exec';

const form = document.getElementById('surveyForm');
const loadingOverlay = document.getElementById('loadingOverlay');

document.addEventListener('DOMContentLoaded', () => {
    initConditionalLogic();
});

// ===== Conditional Logic (Q17 "Да" → show idea input) =====
function initConditionalLogic() {
    const q17Radios = document.querySelectorAll('input[name="q17_ideas"]');
    const q17Block = document.getElementById('q17_conditional');
    q17Radios.forEach(r => {
        r.addEventListener('change', () => {
            q17Block.classList.toggle('show', r.value === 'Да' && r.checked);
        });
    });
}

// ===== Validation =====
function validateForm() {
    let valid = true;
    let firstError = null;

    // Required radio groups
    form.querySelectorAll('.radio-group[data-required="true"]').forEach(group => {
        const name = group.dataset.name;
        const block = group.closest('.question-block');
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
            showError(block, 'Выбери один из вариантов');
            if (!firstError) firstError = block;
            valid = false;
        } else {
            hideError(block);
        }
    });

    // Required checkbox groups
    form.querySelectorAll('.checkbox-group[data-required="true"]').forEach(group => {
        const name = group.dataset.name;
        const block = group.closest('.question-block');
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
            showError(block, 'Выбери хотя бы один вариант');
            if (!firstError) firstError = block;
            valid = false;
        } else {
            hideError(block);
        }
    });

    // Required text/number/textarea inputs
    form.querySelectorAll('input[data-required="true"], textarea[data-required="true"]').forEach(input => {
        const block = input.closest('.question-block');
        if (!input.value.trim()) {
            showError(block, 'Заполни это поле');
            if (!firstError) firstError = block;
            valid = false;
        } else {
            hideError(block);
        }
    });

    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
}

function showError(block, msg) {
    block.classList.add('has-error');
    let el = block.querySelector('.error-message');
    if (!el) { el = document.createElement('div'); el.className = 'error-message'; block.appendChild(el); }
    el.textContent = msg;
    el.style.display = 'block';
}

function hideError(block) {
    block.classList.remove('has-error');
    const el = block.querySelector('.error-message');
    if (el) el.remove();
}

// Clear errors on interaction
document.addEventListener('change', (e) => {
    if (e.target.type === 'radio' || e.target.type === 'checkbox') {
        const block = e.target.closest('.question-block');
        if (block) hideError(block);
    }
});
document.addEventListener('input', (e) => {
    if (e.target.matches('[data-required]')) {
        const block = e.target.closest('.question-block');
        if (block && e.target.value.trim()) hideError(block);
    }
});

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

    form.querySelectorAll('input[type="radio"]:checked').forEach(r => { raw[r.name] = r.value; });

    const cbGroups = {};
    form.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        if (!cbGroups[cb.name]) cbGroups[cb.name] = [];
        cbGroups[cb.name].push(cb.value);
    });
    for (const [name, vals] of Object.entries(cbGroups)) { raw[name] = vals.join('; '); }

    form.querySelectorAll('textarea, input.inline-text, input.text-input').forEach(el => {
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
    if (!validateForm()) return;

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
    // Hide all cards and submit button
    document.querySelectorAll('.step-card, .submit-section').forEach(el => {
        el.style.display = 'none';
    });
    // Show thank you
    const ty = document.getElementById('thankYouCard');
    ty.style.display = '';
    ty.style.animation = 'stepIn 0.4s ease-out';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
