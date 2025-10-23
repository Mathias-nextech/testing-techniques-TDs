function fizzBuzz(number) {
 let result = '';

 if (number % 3 === 0) result += 'Fizz';
 if (number % 5 === 0) result += 'Buzz';

 return result || String(number);
}

module.exports = fizzBuzz;