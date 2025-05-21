const { Pool } = require('pg');

async function deletePresentationById(presentationId) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log(`Starting deletion process for presentation ID: ${presentationId}`);
    
    // Begin transaction
    await pool.query('BEGIN');
    
    // First delete any comments
    const deleteCommentsResult = await pool.query(`
      DELETE FROM comments WHERE slide_id IN (
        SELECT s.id FROM slides s
        JOIN commits c ON s.commit_id = c.id
        JOIN branches b ON c.branch_id = b.id
        WHERE b.presentation_id = $1
      )
    `, [presentationId]);
    console.log(`Deleted ${deleteCommentsResult.rowCount} comments`);
    
    // Delete slides
    const deleteSlidesResult = await pool.query(`
      DELETE FROM slides WHERE commit_id IN (
        SELECT c.id FROM commits c
        JOIN branches b ON c.branch_id = b.id
        WHERE b.presentation_id = $1
      )
    `, [presentationId]);
    console.log(`Deleted ${deleteSlidesResult.rowCount} slides`);
    
    // Delete diffs
    const deleteDiffsResult = await pool.query(`
      DELETE FROM diffs WHERE commit_id IN (
        SELECT c.id FROM commits c
        JOIN branches b ON c.branch_id = b.id
        WHERE b.presentation_id = $1
      )
    `, [presentationId]);
    console.log(`Deleted ${deleteDiffsResult.rowCount} diffs`);
    
    // Delete commits
    const deleteCommitsResult = await pool.query(`
      DELETE FROM commits WHERE branch_id IN (
        SELECT id FROM branches WHERE presentation_id = $1
      )
    `, [presentationId]);
    console.log(`Deleted ${deleteCommitsResult.rowCount} commits`);
    
    // Delete branches
    const deleteBranchesResult = await pool.query(`
      DELETE FROM branches WHERE presentation_id = $1
    `, [presentationId]);
    console.log(`Deleted ${deleteBranchesResult.rowCount} branches`);
    
    // Delete snapshots if any
    const deleteSnapshotsResult = await pool.query(`
      DELETE FROM snapshots WHERE presentation_id = $1
    `, [presentationId]);
    console.log(`Deleted ${deleteSnapshotsResult.rowCount} snapshots`);
    
    // Delete access controls if any
    const deleteAccessResult = await pool.query(`
      DELETE FROM presentation_access WHERE presentation_id = $1
    `, [presentationId]);
    console.log(`Deleted ${deleteAccessResult.rowCount} access records`);
    
    // Finally delete the presentation
    const deletePresentationResult = await pool.query(`
      DELETE FROM presentations WHERE id = $1 RETURNING id
    `, [presentationId]);
    console.log(`Deleted presentation: ${deletePresentationResult.rowCount} records affected`);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log(`Successfully deleted presentation with ID: ${presentationId}`);
    return true;
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error deleting presentation:', error);
    return false;
  } finally {
    await pool.end();
  }
}

module.exports = { deletePresentationById };