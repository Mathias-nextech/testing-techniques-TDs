function fizzBuzz(number) {
 if (number % 3 === 0) {
 return 'Fizz';
 }
 if (number % 5 === 0) {
 return 'Buzz';
 }
 return String(number);
}

module.exports = fizzBuzz;