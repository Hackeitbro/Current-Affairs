document.addEventListener('DOMContentLoaded', () => {
    const classDetails = {
        '10': {
            '14': {
                class1: 'Introduction to Class 1 - Pratham PAG',
                class2: 'Physical Geography, Date Line\nBasics - Clause, Phrase, Subject, Predicate',
                class3: 'No Test Scheduled'
            },
            '15': {
                class1: 'Class 1: Physical Geography',
                class2: 'Basics: Clause, Phrase, Subject, Predicate',
                class3: 'No Test'
            }
            // Add more dates if needed...
        },
        '11': {
            // November dates can be added here...
        },
        '12': {
            // December dates can be added here...
        }
    };

    const monthDays = {
        '10': 31, // October
        '11': 30, // November
        '12': 31  // December
    };

    const classTimes = {
        class1: '18:00', // 6:00 PM
        class2: '20:00', // 8:00 PM
        class3: '21:30'  // 9:30 PM
    };

    const monthSelect = document.getElementById('month');
    const daysContainer = document.getElementById('days-container');
    const monthTitle = document.getElementById('month-title');
    const selectedDate = document.getElementById('selected-date');

    const class1Info = document.getElementById('class1-info');
    const class2Info = document.getElementById('class2-info');
    const class3Info = document.getElementById('class3-info');

    const saveBtn = document.getElementById('save-btn');
    const editBtn = document.getElementById('edit-btn');
    
    let currentMonth = '10'; // Default month is October
    let currentDay = null;

    // Request notification permission on page load
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Generate days for the selected month
    function generateDays(month) {
        const totalDays = monthDays[month];
        daysContainer.innerHTML = ''; // Clear previous days

        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('span');
            dayElement.innerText = day;
            dayElement.setAttribute('data-day', day);

            // Add click event listener to each day
            dayElement.addEventListener('click', () => {
                currentDay = day;
                selectedDate.innerText = `${monthTitle.innerText} ${day}`;
                loadClassDetails(month, day);
            });

            daysContainer.appendChild(dayElement);
        }
    }

    // Load class details for the selected date
    function loadClassDetails(month, day) {
        const dayDetails = classDetails[month]?.[day];

        if (dayDetails) {
            class1Info.value = dayDetails.class1 || 'No Class Information Available';
            class2Info.value = dayDetails.class2 || 'No Class Information Available';
            class3Info.value = dayDetails.class3 || 'No Class Information Available';
        } else {
            class1Info.value = 'No Class Information Available';
            class2Info.value = 'No Class Information Available';
            class3Info.value = 'No Class Information Available';
        }

        disableEditing(); // Initially disable editing
    }

    // Update the title when the month changes
    function updateMonthTitle(month) {
        const monthNames = { '10': 'October', '11': 'November', '12': 'December' };
        monthTitle.innerText = monthNames[month];
    }

    // Handle month selection change
    monthSelect.addEventListener('change', (e) => {
        currentMonth = e.target.value;
        generateDays(currentMonth);
        updateMonthTitle(currentMonth);
        clearClassDetails(); // Clear class details when switching months
    });

    // Clear class details
    function clearClassDetails() {
        class1Info.value = '';
        class2Info.value = '';
        class3Info.value = '';
        selectedDate.innerText = '';
    }

    // Disable editing of class details
    function disableEditing() {
        class1Info.disabled = true;
        class2Info.disabled = true;
        class3Info.disabled = true;
    }

    // Enable editing of class details
    function enableEditing() {
        class1Info.disabled = false;
        class2Info.disabled = false;
        class3Info.disabled = false;
    }

    // Handle edit button click
    editBtn.addEventListener('click', () => {
        if (currentDay) {
            enableEditing(); // Enable editing
        }
    });

    // Handle save button click
    saveBtn.addEventListener('click', () => {
        if (currentDay) {
            classDetails[currentMonth] = classDetails[currentMonth] || {};
            classDetails[currentMonth][currentDay] = {
                class1: class1Info.value,
                class2: class2Info.value,
                class3: class3Info.value
            };

            disableEditing(); // Disable editing after saving
            alert('Class details saved successfully!');
        }
    });

    // Check the current time and trigger a notification if needed
    function checkClassTimings() {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;

        const notificationTimes = {
            class1: getNotificationTime(classTimes.class1),
            class2: getNotificationTime(classTimes.class2),
            class3: getNotificationTime(classTimes.class3)
        };

        // Trigger notification 5 minutes before any class
        if (currentTime === notificationTimes.class1) {
            showNotification('Class 1', 'Class 1 is starting in 5 minutes!');
        } else if (currentTime === notificationTimes.class2) {
            showNotification('Class 2', 'Class 2 is starting in 5 minutes!');
        } else if (currentTime === notificationTimes.class3) {
            showNotification('Class 3', 'GForm Test is starting in 5 minutes!');
        }
    }

    // Calculate the time 5 minutes before the class starts
    function getNotificationTime(classTime) {
        const [hour, minute] = classTime.split(':');
        const classDate = new Date();
        classDate.setHours(parseInt(hour), parseInt(minute) - 5, 0); // Set time 5 minutes before class start
        const notificationHour = String(classDate.getHours()).padStart(2, '0');
        const notificationMinute = String(classDate.getMinutes()).padStart(2, '0');
        return `${notificationHour}:${notificationMinute}`;
    }

    // Show a desktop notification
    function showNotification(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        } else {
            console.log('Notification permission denied or not requested.');
        }
    }

    // Start checking the time every minute
    setInterval(checkClassTimings, 60000); // Check every minute

    // Initialize with default month
    generateDays(currentMonth);
    updateMonthTitle(currentMonth);
});
