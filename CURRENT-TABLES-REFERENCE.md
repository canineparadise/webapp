# Current Database Tables - Reference

## 1. **profiles**
```sql
- id (UUID) - references auth.users(id)
- email (TEXT)
- first_name (TEXT)
- last_name (TEXT)
- phone (TEXT)
- address (TEXT)
- city (TEXT)
- postcode (TEXT)
- emergency_contact_name (TEXT)
- emergency_contact_phone (TEXT)
- has_dogs (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 2. **dogs**
```sql
- id (UUID)
- owner_id (UUID) - references profiles(id)
- name (TEXT)
- breed (TEXT)
- age_years (INTEGER)
- age_months (INTEGER)
- gender (TEXT) - 'male' or 'female'
- size (TEXT) - 'small', 'medium', 'large', 'extra_large'
- weight_kg (DECIMAL)
- color (TEXT)
- neutered (BOOLEAN)
- microchipped (BOOLEAN)
- vaccinated (BOOLEAN)
- vaccination_expiry (DATE)
- has_vaccination_docs (BOOLEAN)
- photo_url (TEXT)
- flea_treatment (BOOLEAN)
- worming_treatment (BOOLEAN)
- heartworm_prevention (BOOLEAN)
- current_medications (JSONB)
- medication_requirements (TEXT)
- medical_conditions (TEXT)
- allergies (TEXT)
- can_be_given_treats (BOOLEAN)
- energy_level (TEXT)
- behavior_notes (TEXT)
- resource_guarding (BOOLEAN)
- separation_anxiety (BOOLEAN)
- excessive_barking (BOOLEAN)
- leash_pulling (BOOLEAN)
- house_trained (BOOLEAN)
- crate_trained (BOOLEAN)
- aggression_triggers (TEXT)
- behavioral_challenges (TEXT)
- training_needs (TEXT)
- good_with_dogs (BOOLEAN)
- good_with_puppies (BOOLEAN)
- good_with_people (BOOLEAN)
- good_with_cats (BOOLEAN)
- good_with_children (BOOLEAN)
- good_with_strangers (BOOLEAN)
- play_style (TEXT)
- escape_artist (BOOLEAN)
- fence_jumper (BOOLEAN)
- recall_reliability (TEXT)
- vet_name (TEXT)
- vet_phone (TEXT)
- vet_address (TEXT)
- emergency_medical_consent (BOOLEAN)
- max_vet_cost_approval (DECIMAL)
- feeding_schedule (TEXT)
- special_requirements (TEXT)
- favorite_activities (TEXT)
- is_approved (BOOLEAN)
- assessment_completed (BOOLEAN)
- assessment_date (DATE)
- assessment_notes (TEXT)
- total_visits (INTEGER)
- last_visit_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 3. **documents**
```sql
- id (UUID)
- dog_id (UUID) - references dogs(id)
- type (TEXT) - 'vaccination', 'medical', 'insurance', 'other'
- file_url (TEXT)
- file_name (TEXT)
- uploaded_at (TIMESTAMP)
```

## 4. **subscription_tiers** (Admin managed)
```sql
- id (UUID)
- name (TEXT) UNIQUE
- days_included (INTEGER)
- monthly_price (DECIMAL)
- price_per_day (DECIMAL)
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 5. **subscriptions**
```sql
- id (UUID)
- user_id (UUID) - references profiles(id)
- tier_id (UUID) - references subscription_tiers(id)
- days_included (INTEGER)
- days_remaining (INTEGER)
- monthly_price (DECIMAL)
- price_per_day (DECIMAL)
- is_active (BOOLEAN)
- auto_renew (BOOLEAN)
- start_date (DATE)
- end_date (DATE)
- next_billing_date (DATE)
- stripe_subscription_id (TEXT)
- payment_status (TEXT) - 'pending', 'paid', 'failed', 'cancelled'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 6. **bookings**
```sql
- id (UUID)
- user_id (UUID) - references profiles(id)
- dog_id (UUID) - references dogs(id)
- subscription_id (UUID) - references subscriptions(id)
- booking_date (DATE)
- drop_off_time (TIME)
- pick_up_time (TIME)
- status (TEXT) - 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'
- check_in_time (TIMESTAMP)
- check_out_time (TIMESTAMP)
- special_instructions (TEXT)
- staff_notes (TEXT)
- reminder_sent (BOOLEAN)
- reminder_sent_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(dog_id, booking_date)
```

## 7. **assessment_schedule**
```sql
- id (UUID)
- user_id (UUID) - references profiles(id)
- dog_id (UUID) - references dogs(id)
- requested_date (DATE)
- confirmed_date (DATE)
- time_slot (TIME)
- status (TEXT) - 'pending', 'confirmed', 'completed', 'cancelled'
- notes (TEXT)
- admin_notes (TEXT)
- payment_status (TEXT) - 'pending', 'paid', 'refunded'
- payment_amount (DECIMAL)
- stripe_payment_intent_id (TEXT)
- paid_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 8. **legal_agreements**
```sql
- id (UUID)
- user_id (UUID) - references profiles(id) UNIQUE
- terms_accepted (BOOLEAN)
- terms_accepted_at (TIMESTAMP)
- liability_waiver_accepted (BOOLEAN)
- liability_waiver_accepted_at (TIMESTAMP)
- photo_consent (BOOLEAN)
- photo_consent_at (TIMESTAMP)
- injury_waiver_agreed (BOOLEAN)
- photo_permission_granted (BOOLEAN)
- vaccination_requirement_understood (BOOLEAN)
- behavioral_assessment_agreed (BOOLEAN)
- medication_administration_consent (BOOLEAN)
- emergency_contact_consent (BOOLEAN)
- property_damage_waiver (BOOLEAN)
- collection_procedure_agreed (BOOLEAN)
- data_protection_consent (BOOLEAN)
- digital_signature (TEXT)
- signed_at (TIMESTAMP)
- version (TEXT)
- ip_address (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 9. **daycare_settings** (Admin only)
```sql
- id (UUID)
- setting_key (TEXT) UNIQUE
- setting_value (TEXT)
- updated_at (TIMESTAMP)

-- Current settings:
-- 'daily_capacity' = '40'
-- 'assessment_days' = '["Friday"]'
-- 'operating_hours_start' = '07:00:00'
-- 'operating_hours_end' = '19:00:00'
-- 'booking_reminder_hours' = '12'
-- 'assessment_price' = '40.00'
```
