-- INSERT DOGS for all 20 test users
-- Users 1-5: PENDING (dogs not approved, no assessment completed)
-- Users 6-20: APPROVED (dogs approved with assessment completed)

-- ========================================================================
-- PENDING USERS (1-5) - Dogs awaiting approval
-- ========================================================================

-- USER 1: Emma Wilson - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Buddy', 'Golden Retriever', 4, 5, 'male', 'large', 30.0, 'Golden', true, true, true, 'high', 'Friendly and energetic', 'None', 'Standard adult', true, true, true, 'Manchester Vets', '01612345678', false, false
FROM profiles WHERE email = 'emma.wilson@test.com';

-- USER 2: James Brown - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Max', 'Labrador Retriever', 5, 7, 'male', 'large', 32.0, 'Black', true, true, true, 'very_high', 'Very playful and loves water', 'None', 'Active dog formula', true, true, true, 'London Pet Clinic', '02071234567', false, false
FROM profiles WHERE email = 'james.brown@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Bella', 'Border Collie', 3, 3, 'female', 'medium', 18.0, 'Black and White', true, true, true, 'very_high', 'Intelligent, needs mental stimulation', 'None', 'High energy diet', true, false, true, 'London Pet Clinic', '02071234567', false, false
FROM profiles WHERE email = 'james.brown@test.com';

-- USER 3: Sophie Taylor - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Charlie', 'Cocker Spaniel', 4, 0, 'male', 'medium', 14.0, 'Brown', true, true, true, 'moderate', 'Gentle and calm', 'None', 'Standard diet', true, true, true, 'Birmingham Vets', '01213456789', false, false
FROM profiles WHERE email = 'sophie.taylor@test.com';

-- USER 4: Oliver Davis - 3 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Rocky', 'German Shepherd', 6, 2, 'male', 'large', 38.0, 'Black and Tan', true, true, true, 'high', 'Protective but friendly', 'None', 'Large breed diet', true, false, true, 'Leeds Animal Hospital', '01132223344', false, false
FROM profiles WHERE email = 'oliver.davis@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Luna', 'Beagle', 4, 9, 'female', 'small', 12.0, 'Tricolor', true, true, true, 'high', 'Loves to follow scents', 'None', 'Weight control', true, true, true, 'Leeds Animal Hospital', '01132223344', false, false
FROM profiles WHERE email = 'oliver.davis@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Milo', 'Jack Russell Terrier', 3, 5, 'male', 'small', 7.0, 'White and Tan', false, true, true, 'very_high', 'Very energetic, loves to play', 'None', 'Small breed formula', true, true, true, 'Leeds Animal Hospital', '01132223344', false, false
FROM profiles WHERE email = 'oliver.davis@test.com';

-- USER 5: Amelia Martinez - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Daisy', 'Poodle', 5, 0, 'female', 'small', 9.0, 'Cream', true, true, true, 'moderate', 'Calm and affectionate', 'None', 'Hypoallergenic diet', true, true, true, 'Bristol Vets', '01179123456', false, false
FROM profiles WHERE email = 'amelia.martinez@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed)
SELECT id, 'Oscar', 'French Bulldog', 3, 6, 'male', 'small', 11.0, 'Fawn', true, true, true, 'low', 'Snores, needs cool environment', 'Breathing issues - brachycephalic', 'Grain-free diet', true, true, true, 'Bristol Vets', '01179123456', false, false
FROM profiles WHERE email = 'amelia.martinez@test.com';

-- ========================================================================
-- APPROVED USERS (6-20) - Dogs approved with assessments
-- ========================================================================

-- USER 6: Liam Evans - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Alfie', 'Cocker Spaniel', 4, 6, 'male', 'medium', 14.0, 'Golden', true, true, true, 'high', 'Friendly and sociable', 'None', 'Standard diet', true, true, true, 'Bristol Vets', '01179123456', true, true, CURRENT_DATE - INTERVAL '13 days', 'Excellent temperament, great with other dogs'
FROM profiles WHERE email = 'liam.evans@test.com';

-- USER 7: Charlotte Moore - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Ruby', 'Cavalier King Charles Spaniel', 3, 8, 'female', 'small', 8.0, 'Blenheim', true, true, true, 'moderate', 'Sweet and gentle', 'None', 'Standard diet', true, true, true, 'Edinburgh Vets', '01312345678', true, true, CURRENT_DATE - INTERVAL '18 days', 'Very gentle, perfect daycare dog'
FROM profiles WHERE email = 'charlotte.moore@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Toby', 'Yorkshire Terrier', 2, 4, 'male', 'small', 3.5, 'Black and Tan', true, true, true, 'high', 'Confident little dog', 'None', 'Small breed formula', true, true, true, 'Edinburgh Vets', '01312345678', true, true, CURRENT_DATE - INTERVAL '18 days', 'Playful and energetic'
FROM profiles WHERE email = 'charlotte.moore@test.com';

-- USER 8: Ethan Jackson - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Zeus', 'Boxer', 5, 3, 'male', 'large', 35.0, 'Brindle', true, true, true, 'very_high', 'Playful and energetic boxer', 'None', 'High protein diet', true, true, true, 'Glasgow Vets', '01412345678', true, true, CURRENT_DATE - INTERVAL '16 days', 'Great energy, loves to play'
FROM profiles WHERE email = 'ethan.jackson@test.com';

-- USER 9: Mia White - 3 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Poppy', 'Springer Spaniel', 4, 2, 'female', 'medium', 20.0, 'Liver and White', true, true, true, 'very_high', 'Loves to run and play', 'None', 'Active dog formula', true, true, true, 'Liverpool Vets', '01512345678', true, true, CURRENT_DATE - INTERVAL '23 days', 'Excellent recall and socialization'
FROM profiles WHERE email = 'mia.white@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Molly', 'Shih Tzu', 6, 0, 'female', 'small', 6.0, 'Gold and White', true, true, true, 'low', 'Calm and relaxed', 'None', 'Senior diet', true, true, true, 'Liverpool Vets', '01512345678', true, true, CURRENT_DATE - INTERVAL '23 days', 'Very calm, good with all dogs'
FROM profiles WHERE email = 'mia.white@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Archie', 'Pug', 4, 7, 'male', 'small', 8.0, 'Fawn', true, true, true, 'moderate', 'Friendly and sociable', 'Breathing considerations', 'Weight management', true, true, true, 'Liverpool Vets', '01512345678', true, true, CURRENT_DATE - INTERVAL '23 days', 'Monitor in hot weather'
FROM profiles WHERE email = 'mia.white@test.com';

-- USER 10: Lucas Hall - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Cooper', 'Australian Shepherd', 3, 9, 'male', 'medium', 25.0, 'Blue Merle', true, true, true, 'very_high', 'Intelligent and active', 'None', 'High energy formula', true, true, true, 'Newcastle Vets', '01912345678', true, true, CURRENT_DATE - INTERVAL '20 days', 'Very smart, needs stimulation'
FROM profiles WHERE email = 'lucas.hall@test.com';

-- USER 11: Grace Allen - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Rosie', 'Miniature Schnauzer', 5, 1, 'female', 'small', 7.5, 'Salt and Pepper', true, true, true, 'moderate', 'Alert and friendly', 'None', 'Standard diet', true, true, true, 'Sheffield Vets', '01142345678', true, true, CURRENT_DATE - INTERVAL '28 days', 'Well-behaved and sociable'
FROM profiles WHERE email = 'grace.allen@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Teddy', 'Bichon Frise', 4, 5, 'male', 'small', 6.0, 'White', true, true, true, 'moderate', 'Happy and playful', 'None', 'Hypoallergenic diet', true, true, true, 'Sheffield Vets', '01142345678', true, true, CURRENT_DATE - INTERVAL '28 days', 'Great temperament'
FROM profiles WHERE email = 'grace.allen@test.com';

-- USER 12: Henry Young - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Duke', 'Rottweiler', 6, 6, 'male', 'large', 50.0, 'Black and Tan', true, true, true, 'moderate', 'Gentle giant, well-trained', 'None', 'Large breed diet', true, false, true, 'Nottingham Vets', '01159123456', true, true, CURRENT_DATE - INTERVAL '26 days', 'Calm and well-mannered'
FROM profiles WHERE email = 'henry.young@test.com';

-- USER 13: Ella King - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Finn', 'Vizsla', 3, 4, 'male', 'medium', 22.0, 'Rust', true, true, true, 'very_high', 'Athletic and affectionate', 'None', 'Active dog formula', true, true, true, 'Cambridge Vets', '01223456789', true, true, CURRENT_DATE - INTERVAL '33 days', 'Excellent energy levels'
FROM profiles WHERE email = 'ella.king@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Penny', 'Dachshund', 5, 8, 'female', 'small', 9.0, 'Red', true, true, true, 'moderate', 'Curious and playful', 'Back care needed', 'Standard diet', true, true, true, 'Cambridge Vets', '01223456789', true, true, CURRENT_DATE - INTERVAL '33 days', 'Monitor jumping activities'
FROM profiles WHERE email = 'ella.king@test.com';

-- USER 14: Sebastian Wright - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Bear', 'Bernese Mountain Dog', 4, 10, 'male', 'large', 45.0, 'Tricolor', true, true, true, 'moderate', 'Calm and gentle', 'None', 'Large breed diet', true, true, true, 'Oxford Vets', '01865123456', true, true, CURRENT_DATE - INTERVAL '38 days', 'Very gentle and calm'
FROM profiles WHERE email = 'sebastian.wright@test.com';

-- USER 15: Scarlett Lopez - 3 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Jasper', 'Weimaraner', 4, 3, 'male', 'large', 32.0, 'Silver', true, true, true, 'very_high', 'Energetic and intelligent', 'None', 'Active formula', true, true, true, 'Brighton Vets', '01273456789', true, true, CURRENT_DATE - INTERVAL '30 days', 'High energy, great recall'
FROM profiles WHERE email = 'scarlett.lopez@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Willow', 'Whippet', 3, 7, 'female', 'medium', 12.0, 'Brindle', true, true, true, 'high', 'Fast and graceful', 'None', 'Standard diet', true, false, true, 'Brighton Vets', '01273456789', true, true, CURRENT_DATE - INTERVAL '30 days', 'Gentle but speedy'
FROM profiles WHERE email = 'scarlett.lopez@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Chester', 'Boston Terrier', 2, 11, 'male', 'small', 10.0, 'Black and White', true, true, true, 'high', 'Lively and friendly', 'None', 'Small breed formula', true, true, true, 'Brighton Vets', '01273456789', true, true, CURRENT_DATE - INTERVAL '30 days', 'Very sociable'
FROM profiles WHERE email = 'scarlett.lopez@test.com';

-- USER 16: Jack Hill - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Barney', 'Staffordshire Bull Terrier', 5, 5, 'male', 'medium', 17.0, 'Blue', true, true, true, 'moderate', 'Affectionate and loyal', 'None', 'Standard diet', true, false, true, 'Cardiff Vets', '02920123456', true, true, CURRENT_DATE - INTERVAL '25 days', 'Very friendly with people'
FROM profiles WHERE email = 'jack.hill@test.com';

-- USER 17: Isabella Thompson - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Coco', 'Maltese', 4, 4, 'female', 'small', 4.0, 'White', true, true, true, 'moderate', 'Sweet and gentle', 'None', 'Small breed formula', true, true, true, 'Southampton Vets', '02380123456', true, true, CURRENT_DATE - INTERVAL '21 days', 'Perfect temperament'
FROM profiles WHERE email = 'isabella.thompson@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Sammy', 'West Highland Terrier', 6, 1, 'male', 'small', 8.0, 'White', true, true, true, 'moderate', 'Confident and friendly', 'None', 'Standard diet', true, true, true, 'Southampton Vets', '02380123456', true, true, CURRENT_DATE - INTERVAL '21 days', 'Well-socialized'
FROM profiles WHERE email = 'isabella.thompson@test.com';

-- USER 18: Noah Anderson - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Bruno', 'Bullmastiff', 5, 0, 'male', 'large', 55.0, 'Fawn', true, true, true, 'low', 'Calm and protective', 'None', 'Large breed diet', true, false, true, 'Plymouth Vets', '01752123456', true, true, CURRENT_DATE - INTERVAL '24 days', 'Gentle giant'
FROM profiles WHERE email = 'noah.anderson@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Bella', 'English Bulldog', 4, 8, 'female', 'medium', 23.0, 'Brindle and White', true, true, true, 'low', 'Relaxed and friendly', 'Breathing considerations', 'Weight management', true, true, true, 'Plymouth Vets', '01752123456', true, true, CURRENT_DATE - INTERVAL '24 days', 'Monitor in warm weather'
FROM profiles WHERE email = 'noah.anderson@test.com';

-- USER 19: Ava Robinson - 1 dog
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Lola', 'Cockapoo', 3, 2, 'female', 'small', 10.0, 'Apricot', true, true, true, 'high', 'Friendly and playful', 'None', 'Hypoallergenic diet', true, true, true, 'Leicester Vets', '01162345678', true, true, CURRENT_DATE - INTERVAL '27 days', 'Excellent with all dogs'
FROM profiles WHERE email = 'ava.robinson@test.com';

-- USER 20: William Harris - 2 dogs
INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Bailey', 'Labradoodle', 4, 1, 'male', 'medium', 28.0, 'Chocolate', true, true, true, 'high', 'Friendly and intelligent', 'None', 'Active formula', true, true, true, 'York Vets', '01904123456', true, true, CURRENT_DATE - INTERVAL '22 days', 'Great with everyone'
FROM profiles WHERE email = 'william.harris@test.com';

INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, color, neutered, vaccinated, microchipped, energy_level, behavior_notes, medical_conditions, special_dietary_requirements, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, assessment_notes)
SELECT id, 'Ziggy', 'Pointer', 5, 9, 'male', 'large', 27.0, 'Liver and White', true, true, true, 'very_high', 'Energetic hunting breed', 'None', 'Active formula', true, false, true, 'York Vets', '01904123456', true, true, CURRENT_DATE - INTERVAL '22 days', 'High energy, great stamina'
FROM profiles WHERE email = 'william.harris@test.com';

-- Verify all dogs were inserted
SELECT
  p.email,
  p.first_name,
  d.name as dog_name,
  d.breed,
  d.is_approved,
  d.assessment_completed
FROM dogs d
JOIN profiles p ON d.owner_id = p.id
WHERE p.email LIKE '%@test.com'
ORDER BY p.email, d.name;
