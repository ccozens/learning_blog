export async function formatDate(date: string): Promise<string> {
	const dateObject = new Date(date); // without this line it throws an TypeError: toLocaleDateString is not a function, which happens when a string is passed instead of a Date object
	const formattedDate = dateObject.toLocaleDateString('en-GB', {
		year: '2-digit',
		day: 'numeric',
		month: 'short'
	});
	return formattedDate;
}
