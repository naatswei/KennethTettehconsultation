export class Calendar {
    constructor() {
        this.date = new Date();
        this.selectedDate = null;
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();

        this.monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        this.currentMonthEl = document.querySelector('.current-month');
        this.datesEl = document.querySelector('.dates');
        this.prevBtn = document.querySelector('.calendar-nav-btn[aria-label="Previous month"]');
        this.nextBtn = document.querySelector('.calendar-nav-btn[aria-label="Next month"]');
        this.timeSlots = document.querySelectorAll('.time-slot');
        this.enterBtn = document.getElementById('calendar-enter-btn'); // Added: Cache enter button
        this.slotsHeader = document.querySelector('.slots-header h3');
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevMonth());
        this.nextBtn.addEventListener('click', () => this.nextMonth());

        // Event delegation for dates
        this.datesEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('date') && !e.target.classList.contains('empty') && !e.target.classList.contains('disabled')) {
                this.selectDate(e.target);
            }
        });

        // Time slots
        this.timeSlots.forEach(slot => {
            slot.addEventListener('click', (e) => this.selectTimeSlot(e.target));
        });

        // Enter button
        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => this.handleEnter());
        }
    }

    render() {
        this.currentMonthEl.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        this.datesEl.innerHTML = '';

        // Disable enter button initially
        this.updateEnterButtonState(); // Added: Update button state on render

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Adjust for Monday start (0 = Sunday, 1 = Monday ...)
        // If Sunday (0), it becomes 6. Monday (1) becomes 0.
        const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

        // Empty spans for previous month
        for (let i = 0; i < startDayIndex; i++) {
            const span = document.createElement('span');
            span.classList.add('empty');
            this.datesEl.appendChild(span);
        }

        // Days
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const span = document.createElement('span');
            span.classList.add('date');
            span.textContent = i;
            span.dataset.date = i;

            // Check if past date
            const dateToCheck = new Date(this.currentYear, this.currentMonth, i);
            dateToCheck.setHours(0, 0, 0, 0);
            const todayReset = new Date();
            todayReset.setHours(0, 0, 0, 0);

            if (dateToCheck < todayReset) {
                span.classList.add('disabled');
            }

            // Check if selected
            if (this.selectedDate &&
                this.selectedDate.getDate() === i &&
                this.selectedDate.getMonth() === this.currentMonth &&
                this.selectedDate.getFullYear() === this.currentYear) {
                span.classList.add('selected');
            }

            this.datesEl.appendChild(span);
        }
    }

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    }

    selectDate(el) {
        // Remove previous selection
        const prevSelected = this.datesEl.querySelector('.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        el.classList.add('selected');

        // Allow date selection beyond this month/year for logic simplicity (re-rendering handles correctness)
        const day = parseInt(el.dataset.date);
        this.selectedDate = new Date(this.currentYear, this.currentMonth, day);

        this.updateHeader(this.selectedDate);
        this.updateEnterButtonState(); // Added: Update button state after date selection
    }

    selectTimeSlot(el) {
        // Remove selection from all slots
        this.timeSlots.forEach(slot => {
            slot.classList.remove('selected');
            // Remove any inline styles if they exist (cleanup)
            slot.style.borderColor = '';
            slot.style.backgroundColor = '';
            slot.style.color = '';
        });

        // Add selection to clicked slot
        el.classList.add('selected');
        this.selectedTimeSlot = el.textContent; // Added: Store selected time slot
        this.updateEnterButtonState(); // Added: Update button state after time selection
    }

    updateHeader(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.slotsHeader.textContent = date.toLocaleDateString('en-US', options);
    }

    // Added: New method to update the state of the Enter button
    updateEnterButtonState() {
        if (this.enterBtn) {
            // Check if both date and time are selected
            const hasDate = !!this.selectedDate;
            const hasTime = !!document.querySelector('.time-slot.selected');

            if (hasDate && hasTime) {
                this.enterBtn.disabled = false;
                this.enterBtn.style.opacity = '1';
                this.enterBtn.style.cursor = 'pointer';
            } else {
                this.enterBtn.disabled = true;
                this.enterBtn.style.opacity = '0.5';
                this.enterBtn.style.cursor = 'not-allowed';
            }
        }
    }

    // Added: New method to handle the Enter button click
    handleEnter() {
        if (!this.enterBtn.disabled) {
            // Check if there is a pricing section or booking form to scroll to
            const pricingSection = document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.log('Selection Confirmed:', {
                    date: this.selectedDate,
                    time: this.selectedTimeSlot
                });
                alert(`Appointment Reserved for ${this.selectedDate.toLocaleDateString()} at ${this.selectedTimeSlot}`);
            }
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
