// function toggleMenu() {
//     const navLinks = document.querySelector('.nav-links');
//     navLinks.classList.toggle('show-links');
//   }

function toggleMenu() {
    console.log("hii")
    const navLinks = document.querySelector('.nav-links');
    const contact = document.querySelector('.contact');
    const login = document.querySelector('.login');
    const main = document.querySelector('.nav-main');
    main.classList.toggle('mb-24');
    navLinks.classList.toggle('mobile:invisible');
    navLinks.classList.toggle('hidden');
  }