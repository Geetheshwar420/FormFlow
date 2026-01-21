/**
 * Migration utility to create form_lookups for existing forms
 * Run this once to ensure all existing forms have lookup entries
 */

import { getDocs, collection, doc, setDoc, Firestore, query, where } from 'firebase/firestore';

export async function migrateExistingFormsToLookups(firestore: Firestore) {
  try {
    console.log('Starting migration of existing forms...');
    
    // Get all users
    const usersRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let migratedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Get all forms for this user
      const formsRef = collection(firestore, 'users', userId, 'forms');
      const formsSnapshot = await getDocs(formsRef);
      
      for (const formDoc of formsSnapshot.docs) {
        const formId = formDoc.id;
        const formData = formDoc.data();
        
        // Check if lookup already exists
        const lookupRef = doc(firestore, 'form_lookups', formId);
        
        try {
          // Try to create the lookup document
          // This will fail silently if it already exists with merge: true
          await setDoc(
            lookupRef,
            { ownerId: userId },
            { merge: true }
          );
          migratedCount++;
          console.log(`Created lookup for form: ${formId}`);
        } catch (error) {
          console.error(`Failed to create lookup for form ${formId}:`, error);
        }
      }
    }
    
    console.log(`Migration complete! Created/updated ${migratedCount} form lookups.`);
    return { success: true, migratedCount };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
