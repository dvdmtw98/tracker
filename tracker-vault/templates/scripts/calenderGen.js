// https://github.com/pn11/mdcal/blob/master/mdcal.py
// https://gist.github.com/ii64/f4ab44eba21ad90e867f1bf069ec6973
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay
// https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript

const daysInMonth = (year, month) => {
	return new Date(year, month, 0).getDate();
};

const dayOfTheWeek = (year, month) => {
	return new Date(year, month - 1, 1).getDay();
};

const leftPad = (number, width, paddingChar) => {
	paddingChar = paddingChar || "0";
	number = number + "";

	if (number.length >= width) {
		return number;
	} else {
		return paddingChar.repeat(width - number.length) + number;
	}
};

const isInteger = (value) => {
	return /^-*\d+$/.test(value);
};

const printCalender = (year, month, line_start) => {
	let yearCalender = "";
	const monthDays = daysInMonth(year, month);
	const monthPadding = dayOfTheWeek(year, month);

	// Creating header for each month
	yearCalender += line_start + year + "/" + leftPad(month, 2) + "\n" + line_start + "\n";
	yearCalender += line_start + "| Sun | Mon | Tue | Wed | Thr | Fri | Sat |\n";
	yearCalender += line_start + "| :-: | :-: | :-: | :-: | :-: | :-: | :-: |\n";

	// Padding required at the start of the month
	let weekDays = line_start + "|     ".repeat(monthPadding);

	let dayCounter;
	// Generate the calender (leaving last week)
	for (dayCounter = 1; dayCounter <= monthDays; dayCounter++) {
		weekDays += "|  " + leftPad(dayCounter, 2) + " ";
		if ((monthPadding + dayCounter) % 7 == 0) {
			yearCalender += weekDays + "|\n";
			weekDays = line_start;
		}
	}

	// Adding Padding required at the end of month + Last week)
	if ((monthPadding + dayCounter - 1) % 7 != 0) {
		const endPadding = 7 - ((monthPadding + dayCounter - 1) % 7);
		weekDays += "|     ".repeat(endPadding) + "|";
	}
	yearCalender += weekDays + "\n";

	return yearCalender;
};

const calender = (year, month, onwards, callout) => {
	if (!isInteger(year) || !isInteger(month)) {
		return "Invalid inputs provided for year and/or month";
	}

	year = parseInt(year);
	month = parseInt(month);

	const line_start = callout ? "> " : "";
	let finalCalender = callout ? `> [!INFO]- Tracking - ${year}\n` : "";

	if (year && month != -1 && !onwards) {
		finalCalender += printCalender(year, month, line_start);
		return finalCalender;
	} else if (year && month == -1 && onwards) {
		for (let month = 1; month <= 12; month++) {
			finalCalender += printCalender(year, month, line_start);
			finalCalender += month != 12 ? line_start + "\n" : "";
		}
		return finalCalender;
	} else if (year && month != -1 && onwards) {
		for (let monthCounter = month; monthCounter <= 12; monthCounter++) {
			finalCalender += printCalender(year, monthCounter, line_start);
			finalCalender += monthCounter != 12 ? line_start + "\n" : "";
		}
		return finalCalender;
	}
};

// console.log(calender(2024, 3, false, true));
module.exports = calender;
