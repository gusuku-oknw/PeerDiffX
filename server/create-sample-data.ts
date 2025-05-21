import { db } from './db';
import { presentations, branches, commits, slides, diffs } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function createSampleData() {
  try {
    console.log('Creating sample presentation data...');
    
    // Create a sample presentation for the given user
    const userId = '41964833'; // This is the ID of the Replit Auth user
    
    // Check if the user already has presentations
    const userPresentations = await db.select()
      .from(presentations)
      .where(eq(presentations.userId, parseInt(userId)));
    
    if (userPresentations.length > 0) {
      console.log('User already has presentations. Skipping sample data creation.');
      return;
    }
    
    // Create a new presentation directly with the database
    const [presentation] = await db.insert(presentations)
      .values({
        name: 'Company Overview Q2 2025',
        description: 'Quarterly business review presentation',
        userId: parseInt(userId),
        isPublic: true,
        status: 'active',
        thumbnail: null
      })
      .returning();
    
    console.log(`Created presentation: ${presentation.name} (ID: ${presentation.id})`);
    
    // Create main branch
    const [mainBranch] = await db.insert(branches)
      .values({
        name: 'main',
        presentationId: presentation.id,
        isDefault: true,
      })
      .returning();
    
    console.log(`Created main branch (ID: ${mainBranch.id})`);
    
    // Create a feature branch
    const [featureBranch] = await db.insert(branches)
      .values({
        name: 'new-product-slides',
        presentationId: presentation.id,
        isDefault: false,
      })
      .returning();
    
    console.log(`Created feature branch (ID: ${featureBranch.id})`);
    
    // Create initial commit for main branch
    const [initialCommit] = await db.insert(commits)
      .values({
        message: 'Initial presentation structure',
        branchId: mainBranch.id,
        parentId: null,
        userId: parseInt(userId)
      })
      .returning();
    
    console.log(`Created initial commit (ID: ${initialCommit.id})`);
    
    // Create slides for the initial commit
    const [titleSlide] = await db.insert(slides)
      .values({
        commitId: initialCommit.id,
        slideNumber: 1,
        title: 'Company Overview',
        content: {
          elements: [
            {
              id: 'title1',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 100,
              content: 'Company Overview Q2 2025',
              style: { fontSize: 32, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'subtitle1',
              type: 'text',
              x: 100,
              y: 220,
              width: 600,
              height: 50,
              content: 'Quarterly Business Review',
              style: { fontSize: 24, color: '#666666' }
            }
          ],
          background: '#ffffff'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Company Overview Q2 2025</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Quarterly Business Review</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      })
      .returning();
    
    await db.insert(slides)
      .values({
        commitId: initialCommit.id,
        slideNumber: 2,
        title: 'Agenda',
        content: {
          elements: [
            {
              id: 'title2',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 60,
              content: 'Agenda',
              style: { fontSize: 28, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'bullet1',
              type: 'text',
              x: 120,
              y: 180,
              width: 580,
              height: 40,
              content: '• Financial Highlights',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet2',
              type: 'text',
              x: 120,
              y: 230,
              width: 580,
              height: 40,
              content: '• Q2 Achievements',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet3',
              type: 'text',
              x: 120,
              y: 280,
              width: 580,
              height: 40,
              content: '• Upcoming Product Roadmap',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet4',
              type: 'text',
              x: 120,
              y: 330,
              width: 580,
              height: 40,
              content: '• Q3 Goals',
              style: { fontSize: 20, color: '#444444' }
            }
          ],
          background: '#f5f5f5'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Agenda</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Financial Highlights</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Q2 Achievements</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Upcoming Product Roadmap</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Q3 Goals</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      });
    
    console.log(`Created slides for the initial commit`);
    
    // Create a second commit with changes
    const [secondCommit] = await db.insert(commits)
      .values({
        message: 'Added financial results slide',
        branchId: mainBranch.id,
        parentId: initialCommit.id,
        userId: parseInt(userId)
      })
      .returning();
    
    console.log(`Created second commit (ID: ${secondCommit.id})`);
    
    // Add slides from first commit to second commit
    await db.insert(slides)
      .values({
        commitId: secondCommit.id,
        slideNumber: 1,
        title: 'Company Overview',
        content: {
          elements: [
            {
              id: 'title1',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 100,
              content: 'Company Overview Q2 2025',
              style: { fontSize: 32, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'subtitle1',
              type: 'text',
              x: 100,
              y: 220,
              width: 600,
              height: 50,
              content: 'Quarterly Business Review',
              style: { fontSize: 24, color: '#666666' }
            }
          ],
          background: '#ffffff'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Company Overview Q2 2025</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Quarterly Business Review</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      });
    
    await db.insert(slides)
      .values({
        commitId: secondCommit.id,
        slideNumber: 2,
        title: 'Agenda',
        content: {
          elements: [
            {
              id: 'title2',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 60,
              content: 'Agenda',
              style: { fontSize: 28, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'bullet1',
              type: 'text',
              x: 120,
              y: 180,
              width: 580,
              height: 40,
              content: '• Financial Highlights',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet2',
              type: 'text',
              x: 120,
              y: 230,
              width: 580,
              height: 40,
              content: '• Q2 Achievements',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet3',
              type: 'text',
              x: 120,
              y: 280,
              width: 580,
              height: 40,
              content: '• Upcoming Product Roadmap',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet4',
              type: 'text',
              x: 120,
              y: 330,
              width: 580,
              height: 40,
              content: '• Q3 Goals',
              style: { fontSize: 20, color: '#444444' }
            }
          ],
          background: '#f5f5f5'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Agenda</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Financial Highlights</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Q2 Achievements</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Upcoming Product Roadmap</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Q3 Goals</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      });
    
    // Add a new financial results slide
    await db.insert(slides)
      .values({
        commitId: secondCommit.id,
        slideNumber: 3,
        title: 'Financial Results',
        content: {
          elements: [
            {
              id: 'title3',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 60,
              content: 'Financial Results - Q2 2025',
              style: { fontSize: 28, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'revenue',
              type: 'text',
              x: 120,
              y: 180,
              width: 580,
              height: 40,
              content: '• Revenue: $4.8M (+12% YoY)',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'profit',
              type: 'text',
              x: 120,
              y: 230,
              width: 580,
              height: 40,
              content: '• Net Profit: $1.2M (+8% YoY)',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'customers',
              type: 'text',
              x: 120,
              y: 280,
              width: 580,
              height: 40,
              content: '• New Customers: 145 (+24% YoY)',
              style: { fontSize: 20, color: '#444444' }
            }
          ],
          background: '#f5f5f5'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Financial Results - Q2 2025</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Revenue: $4.8M (+12% YoY)</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Net Profit: $1.2M (+8% YoY)</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• New Customers: 145 (+24% YoY)</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      });
    
    console.log(`Created slides for the second commit`);
    
    // Create a feature branch commit
    const [featureCommit] = await db.insert(commits)
      .values({
        message: 'Added new product slide',
        branchId: featureBranch.id,
        parentId: initialCommit.id,
        userId: parseInt(userId)
      })
      .returning();
    
    console.log(`Created feature branch commit (ID: ${featureCommit.id})`);
    
    // Copy the first two slides to feature branch
    await db.insert(slides)
      .values({
        commitId: featureCommit.id,
        slideNumber: 1,
        title: 'Company Overview',
        content: {
          elements: [
            {
              id: 'title1',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 100,
              content: 'Company Overview Q2 2025',
              style: { fontSize: 32, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'subtitle1',
              type: 'text',
              x: 100,
              y: 220,
              width: 600,
              height: 50,
              content: 'Quarterly Business Review',
              style: { fontSize: 24, color: '#666666' }
            }
          ],
          background: '#ffffff'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Company Overview Q2 2025</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Quarterly Business Review</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      });
    
    await db.insert(slides)
      .values({
        commitId: featureCommit.id,
        slideNumber: 2,
        title: 'Agenda',
        content: {
          elements: [
            {
              id: 'title2',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 60,
              content: 'Agenda',
              style: { fontSize: 28, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'bullet1',
              type: 'text',
              x: 120,
              y: 180,
              width: 580,
              height: 40,
              content: '• Financial Highlights',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet2',
              type: 'text',
              x: 120,
              y: 230,
              width: 580,
              height: 40,
              content: '• Q2 Achievements',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet3',
              type: 'text',
              x: 120,
              y: 280,
              width: 580,
              height: 40,
              content: '• Upcoming Product Roadmap',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'bullet4',
              type: 'text',
              x: 120,
              y: 330,
              width: 580,
              height: 40,
              content: '• Q3 Goals',
              style: { fontSize: 20, color: '#444444' }
            }
          ],
          background: '#f5f5f5'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Agenda</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Financial Highlights</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Q2 Achievements</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Upcoming Product Roadmap</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Q3 Goals</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      });
    
    // Add a new product slide
    await db.insert(slides)
      .values({
        commitId: featureCommit.id,
        slideNumber: 3,
        title: 'New Product: AI Assistant',
        content: {
          elements: [
            {
              id: 'title4',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 60,
              content: 'New Product: AI Assistant Pro',
              style: { fontSize: 28, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'feature1',
              type: 'text',
              x: 120,
              y: 180,
              width: 580,
              height: 40,
              content: '• Advanced natural language processing',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'feature2',
              type: 'text',
              x: 120,
              y: 230,
              width: 580,
              height: 40,
              content: '• Multi-platform integration',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'feature3',
              type: 'text',
              x: 120,
              y: 280,
              width: 580,
              height: 40,
              content: '• Enterprise-grade security',
              style: { fontSize: 20, color: '#444444' }
            },
            {
              id: 'feature4',
              type: 'text',
              x: 120,
              y: 330,
              width: 580,
              height: 40,
              content: '• Launch date: Sept 15, 2025',
              style: { fontSize: 20, color: '#444444' }
            }
          ],
          background: '#e6f7ff'
        },
        xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>New Product: AI Assistant Pro</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Advanced natural language processing</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Multi-platform integration</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Enterprise-grade security</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>• Launch date: Sept 15, 2025</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
      });
    
    console.log(`Created slides for the feature branch commit`);
    
    // Create a diff between commits
    await db.insert(diffs)
      .values({
        commitId: featureCommit.id,
        slideId: titleSlide.id,
        diffContent: {
          added: [
            {
              id: 'title4',
              type: 'text',
              x: 100,
              y: 100,
              width: 600, 
              height: 60,
              content: 'New Product: AI Assistant Pro',
              style: { fontSize: 28, fontWeight: 'bold', color: '#333333' }
            }
          ],
          deleted: [],
          modified: []
        },
        changeType: 'added'
      });
    
    console.log(`Created diff between commits`);
    
    console.log('Sample data creation complete!');
    return presentation.id;
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}

createSampleData()
  .then((presentationId) => {
    console.log(`Successfully created sample data with presentation ID: ${presentationId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create sample data:', error);
    process.exit(1);
  });