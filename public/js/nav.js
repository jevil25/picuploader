// function toggleMenu() {
//     const navLinks = document.querySelector('.nav-links');
//     navLinks.classList.toggle('show-links');
//   }

const main = document.querySelector('.nav-main');

main.classList.remove("mobile:mb-24");

function toggleMenu() {
    console.log("hii")
    const navLinks = document.querySelector('.nav-links');
    const contact = document.querySelector('.contact');
    const login = document.querySelector('.login');
    navLinks.classList.toggle('mobile:invisible');
    main.classList.toggle('mobile:mb-24');
  }