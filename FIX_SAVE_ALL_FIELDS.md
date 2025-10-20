# THE PROBLEM

We're only saving a TINY subset of fields to the database:
- name, breed, age_years, age_months, gender, size, weight_kg
- neutered, microchipped, vaccinated
- authorized_dropoff_people, authorized_pickup_people, checkout_password
- is_draft, draft_section

But the FORM has MANY MORE fields that users fill out:
- date_of_birth
- vaccination_expiry
- vet_name, vet_phone, vet_address
- emergency_medical_consent, max_vet_cost_approval
- feeding_schedule, special_requirements, favorite_activities
- medical_conditions, allergies
- And MORE

## THE FIX

We need to EITHER:
1. Add ALL these columns to the database (BEST solution)
2. Use localStorage to save the form state temporarily (QUICK fix)

## RECOMMENDATION

Use **localStorage** for draft forms - it's simpler and faster. When they complete the form, THEN save everything to the database.
