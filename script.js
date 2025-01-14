class MoodBoard {
    constructor() {
        this.currentMood = {
            score: 5,
            tags: [],
            note: '',
            date: new Date().toISOString().split('T')[0]
        };
        
        this.init();
        this.loadHistory();
    }
    
    init() {
        this.setupEventListeners();
        this.updateMoodValue();
    }
    
    setupEventListeners() {
        const moodSlider = document.getElementById('moodSlider');
        const tags = document.querySelectorAll('.tag');
        const noteInput = document.getElementById('noteInput');
        const saveButton = document.getElementById('saveButton');
        
        moodSlider.addEventListener('input', (e) => {
            this.currentMood.score = parseInt(e.target.value);
            this.updateMoodValue();
        });
        
        tags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.toggleTag(e.target);
            });
        });
        
        noteInput.addEventListener('input', (e) => {
            this.currentMood.note = e.target.value;
        });
        
        saveButton.addEventListener('click', () => {
            this.saveMood();
        });
    }
    
    updateMoodValue() {
        const moodValue = document.getElementById('moodValue');
        const emoji = this.getMoodEmoji(this.currentMood.score);
        moodValue.textContent = `${this.currentMood.score} ${emoji}`;
    }
    
    getMoodEmoji(score) {
        if (score <= 2) return '😢';
        if (score <= 4) return '😔';
        if (score <= 6) return '😐';
        if (score <= 8) return '🙂';
        return '😊';
    }
    
    toggleTag(tagElement) {
        const tagName = tagElement.dataset.tag;
        const index = this.currentMood.tags.indexOf(tagName);
        
        if (index > -1) {
            this.currentMood.tags.splice(index, 1);
            tagElement.classList.remove('selected');
        } else {
            this.currentMood.tags.push(tagName);
            tagElement.classList.add('selected');
        }
    }
    
    saveMood() {
        if (this.currentMood.tags.length === 0) {
            alert('请至少选择一个情绪标签！');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        this.currentMood.date = today;
        
        try {
            let moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
            
            const existingIndex = moodHistory.findIndex(entry => entry.date === today);
            if (existingIndex > -1) {
                moodHistory[existingIndex] = { ...this.currentMood };
            } else {
                moodHistory.push({ ...this.currentMood });
            }
            
            moodHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
            
            this.showSaveMessage();
            this.loadHistory();
            this.resetForm();
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请重试！');
        }
    }
    
    showSaveMessage() {
        const saveButton = document.getElementById('saveButton');
        const originalText = saveButton.textContent;
        saveButton.textContent = '已保存！';
        saveButton.style.background = '#28a745';
        
        setTimeout(() => {
            saveButton.textContent = originalText;
            saveButton.style.background = '';
        }, 2000);
    }
    
    resetForm() {
        this.currentMood = {
            score: 5,
            tags: [],
            note: '',
            date: new Date().toISOString().split('T')[0]
        };
        
        document.getElementById('moodSlider').value = 5;
        document.getElementById('noteInput').value = '';
        document.querySelectorAll('.tag').forEach(tag => {
            tag.classList.remove('selected');
        });
        
        this.updateMoodValue();
    }
    
    loadHistory() {
        const historyList = document.getElementById('historyList');
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        
        if (moodHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">还没有记录，开始记录你的第一个心情吧！</p>';
            return;
        }
        
        historyList.innerHTML = moodHistory.map(entry => {
            const date = new Date(entry.date);
            const formattedDate = date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
            
            const tagsHtml = entry.tags.map(tag => 
                `<span class="mood-entry-tag">${tag}</span>`
            ).join('');
            
            const noteHtml = entry.note ? 
                `<div class="mood-entry-note">"${entry.note}"</div>` : '';
            
            return `
                <div class="mood-entry">
                    <div class="mood-entry-date">${formattedDate}</div>
                    <div class="mood-entry-score">${entry.score}/10 ${this.getMoodEmoji(entry.score)}</div>
                    <div class="mood-entry-tags">${tagsHtml}</div>
                    ${noteHtml}
                </div>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MoodBoard();
});