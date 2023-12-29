const express = require('express');
const router = express.Router();
const { dbB } = require('../model/db');

router.get('/', (req, res) => {

  const sql = `SELECT * FROM bmp_academy_details WHERE sport="mma" and (about IS NULL OR about = "")`;
  dbB.query(sql, async (error, result) => {
    if (error) {
      res.send(error)
    } else {

      let currentSelection = 0
      for (let i = 0; i <= result.length - 1; i++) {6
        console.log("result[i].id -->", result[i].id)
        // await new Promise((resolve, reject) => {
        let academy_name = result[i].name == null || result[i].name == "" || result[i].name == undefined ? 'academy' : result[i].name
        let city = result[i].city == null || result[i].city == "" || result[i].city == undefined ? 'India' : result[i].city
        let sport = result[i].sport == null || result[i].sport == "" || result[i].sport == undefined ? 'sport' : result[i].sport
        let owner = result[i].i_owner_name == null || result[i].i_owner_name == "" || result[i].i_owner_name == undefined ? 'experienced coaches' : result[i].owner
        let website = result[i].website == null || result[i].website == "" || result[i].website == undefined ? `` : `visit our website at  ${result[i].website},`
        let social_facebook = result[i].facebook == null || result[i].facebook == "" || result[i].facebook == undefined ? `` : `Facebook: (${result[i].facebook},`
        let social_instagram = result[i].instagram == null || result[i].instagram == "" || result[i].instagram == undefined ? `` : `Instagram: ${result[i].instagram},`
        let email = result[i].email == null || result[i].email == "" || result[i].email == undefined ? `` : `email at ${result[i].email}`
        let phone = result[i].phone == null || result[i].phone == "" || result[i].phone == undefined ? `` : `WhatsApp/Mobile at ${result[i].phone}`


        let queryOne = `
${academy_name} in ${city} is a premier training center dedicated to the art and discipline of martial arts, with a 
particular focus on Mixed Martial Arts (MMA). Emphasizing a blend of physical fitness, self-defense, and combat skills, the academy caters to a wide 
range of enthusiasts, from beginners to seasoned martial artists.
Boasting state-of-the-art facilities and a team of experienced instructors, ${academy_name} offers a comprehensive curriculum that encompasses various 
martial arts techniques and styles. The training environment is designed to foster discipline, respect, and a strong sense of community among students, 
encouraging them to push their limits and achieve their personal and martial arts goals.
The academy's programs are tailored for all ages and skill levels, ensuring a supportive and inclusive atmosphere. Whether it's for fitness, competition, 
or personal growth, ${academy_name} provides an ideal setting for individuals looking to explore the world of martial arts. 
The academy takes pride in its commitment to excellence and the holistic development of its students, making it a revered name in ${city}'s martial arts 
scene.`

        let queryTwo = `
${academy_name} in ${city} is a leading institution dedicated to the art and discipline of martial arts, offering a diverse 
range of training programs for individuals of all ages and skill levels. Known for its emphasis on both traditional and contemporary martial arts 
techniques, the academy prides itself on fostering an environment of respect, discipline, and physical fitness.
The academy's experienced instructors are committed to providing high-quality training, focusing on the holistic development of each student. 
With classes ranging from beginner to advanced levels, the ${academy_name} caters to a wide spectrum of martial arts enthusiasts, 
whether they are seeking self-defense skills, physical conditioning, or competitive training.
Equipped with state-of-the-art facilities, the academy offers a safe and supportive space for students to learn and grow. The training programs are 
designed to enhance physical agility, strength, and endurance, while also instilling important values such as perseverance, mental resilience, 
and teamwork.
For those in ${city} looking to embark on a journey in martial arts, the ${academy_name} stands out as a premier destination. 
It’s not just a training center, but a community where students can develop their skills, build confidence, and join a network of martial arts 
practitioners`

        let queryThree = `
${academy_name} in ${city} stands as a beacon of excellence in the world of martial arts training. Renowned for its comprehensive programs, the academy offers a unique blend of traditional martial arts and modern fitness techniques, catering to a diverse range of enthusiasts, from beginners to advanced practitioners.
The academy's experienced instructors are dedicated to providing top-notch training in disciplines such as Karate, Taekwondo, Muay Thai, and Brazilian Jiu-Jitsu. Each program is meticulously crafted to enhance physical strength, flexibility, and endurance while instilling key values like discipline, respect, and self-confidence.
${academy_name} boasts state-of-the-art facilities equipped to support a variety of training needs. The academy emphasizes not just skill development but also personal growth, ensuring that students achieve their fitness goals and develop a deep understanding of martial arts philosophy.
With a welcoming community and a commitment to fostering talent, the academy provides an ideal environment for anyone in ${city} looking to delve into the world of martial arts. Whether for self-defense, fitness, or as a competitive sport, the academy nurtures and guides its students on their martial arts journey.
`
        let selectionCriteria = [queryOne, queryTwo, queryThree]
        if (currentSelection == selectionCriteria.length) { currentSelection = 0 }


        // console.log(`currentSelection --->`, selectionCriteria[currentSelection])
        // let query = `update bmp_academy_details1 set about = "${selectionCriteria[currentSelection]}" where id = ${result[i].id}`

        // console.log('current selection index --->', query)
        // currentSelection += 1
        // console.log()
        // console.log()
        // console.log()

        await new Promise((resolve, reject) => {
        // let query = `update bmp_academy_details1 set about = "${selectionCriteria[currentSelection]}" where id = ${result[i].id}`
        let query = `UPDATE bmp_academy_details SET about = "${selectionCriteria[currentSelection]}" WHERE (about IS NULL OR about = "") AND id = ${result[i].id}`;

        dbB.query(query, (error, result) => {
            if (error) {
              reject(error);
            } else {
              console.log(`query -->`, query)
              resolve(result);
              currentSelection += 1
            }
          });
        });

      }


    }
  })

})

module.exports = router;
