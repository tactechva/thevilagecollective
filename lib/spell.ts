/*
  A count written out.

  The number of businesses was typed into the copy in five places, so it could
  drift from the data, and did: adding a member meant remembering all five. It
  lives here rather than in data/members.ts because the flower world is a client
  component and importing the member list to count it would ship all of it to the
  browser. The pages pass the number in; this only spells it.
*/
export function spellCount(n: number, sentenceStart = false): string {
  const ones = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
    "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 0 || n > 99) return String(n);
  const word = n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? `-${ones[n % 10]}` : "");
  return sentenceStart ? word[0].toUpperCase() + word.slice(1) : word;
}
