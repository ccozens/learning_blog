export function getCurrentDateFormatted(): string {
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const monthsOfYear = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const currentDate = new Date();
	const dayOfWeek = daysOfWeek[currentDate.getDay()];
	const dayOfMonth = currentDate.getDate();
	const month = monthsOfYear[currentDate.getMonth()];

	function getDaySuffix(day: number) {
		if (day >= 11 && day <= 13) {
			return 'th';
		}
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	const daySuffix = getDaySuffix(dayOfMonth);

	return `${dayOfWeek} ${dayOfMonth}${daySuffix} ${month}`;
}
