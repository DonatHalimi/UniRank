import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { uploadDirectory } from '../config/storage.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Material from '../models/Material.js';

function createPdf(text) {
  const safe = text.replace(/[()\\]/g, '\\$&');
  const stream = `BT /F1 18 Tf 72 740 Td (${safe}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}

async function ensureUser(data) {
  let user = await User.findOne({ email: data.email });
  if (!user) user = await User.create(data);
  return user;
}

try {
  await connectDatabase();
  await fs.mkdir(uploadDirectory, { recursive: true });
  const admin = await ensureUser({ username: 'unirank_admin', email: 'admin@unirank.demo', password: 'AdminPass123!', role: 'admin', university: 'University of Prishtina', faculty: 'Administration', isVerified: true });
  const professors = await Promise.all([
    ensureUser({ username: 'professor_arta', email: 'arta@unirank.demo', password: 'DemoPass123!', role: 'professor', university: 'University of Prishtina', faculty: 'Computer Science', isVerified: true }),
    ensureUser({ username: 'professor_blerim', email: 'blerim@unirank.demo', password: 'DemoPass123!', role: 'professor', university: 'University of Ferizaj', faculty: 'Engineering', isVerified: true }),
  ]);
  const students = await Promise.all(Array.from({ length: 5 }, (_, index) => ensureUser({
    username: `student_${index + 1}`, email: `student${index + 1}@unirank.demo`, password: 'DemoPass123!', role: 'student',
    university: ['University of Prishtina', 'University of Ferizaj', 'AAB College'][index % 3],
    faculty: ['Computer Science', 'Economics', 'Engineering'][index % 3],
  })));

  const universityFaculties = [
    { university: 'University of Prishtina', faculties: ['Computer Science', 'Economics', 'Law'] },
    { university: 'University of Ferizaj', faculties: ['Engineering', 'Business', 'Applied Arts'] },
    { university: 'AAB College', faculties: ['Computer Science', 'Social Sciences', 'Health Sciences'] },
  ];
  const templates = [
    ['Introduction to Programming', 'Programming Fundamentals', 'Data Structures', 'Database Systems', 'Software Engineering'],
    ['Microeconomics', 'Macroeconomics', 'Business Statistics', 'Financial Accounting', 'Public Finance'],
    ['Constitutional Law', 'Civil Law', 'Criminal Law', 'Administrative Law', 'Legal Research'],
    ['Engineering Mathematics', 'Materials Science', 'Technical Drawing', 'Electrical Circuits', 'Project Design'],
    ['Business Management', 'Marketing Principles', 'Entrepreneurship', 'Operations Management', 'Business Finance'],
    ['Design Principles', 'Digital Illustration', 'Visual Communication', 'Art History', 'Creative Practice'],
    ['Research Methods', 'Sociology', 'Psychology', 'Communication Theory', 'Academic Writing'],
    ['Human Anatomy', 'Public Health', 'Biochemistry', 'Health Promotion', 'Clinical Practice'],
  ];
  const subjects = [];
  let sequence = 0;
  for (const [uIndex, university] of universityFaculties.entries()) {
    for (const [fIndex, faculty] of university.faculties.entries()) {
      const names = templates[(uIndex * 3 + fIndex) % templates.length];
      for (let index = 0; index < 5; index += 1) {
        const code = `${faculty.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase()}${String(index + 1).padStart(2, '0')}`;
        let subject = await Subject.findOne({ university: university.university, faculty, code });
        if (!subject) subject = await Subject.create({
          name: names[index], code, university: university.university, faculty,
          description: `${names[index]} course materials, revision notes and past examination resources.`,
          professors: [professors[(sequence + uIndex + fIndex) % professors.length].username],
          semester: index % 2 ? 'Spring 2026' : 'Fall 2026', credits: 5, createdBy: admin._id,
        });
        subjects.push(subject); sequence += 1;
      }
    }
  }

  const fileTypes = ['past_exam', 'summary', 'lecture_note', 'cheat_sheet'];
  for (let index = 0; index < 20; index += 1) {
    const subject = subjects[index % subjects.length];
    const title = `${subject.name} ${index % 2 ? 'Revision Notes' : 'Sample Past Exam'} ${index + 1}`;
    if (await Material.findOne({ title, subjectId: subject._id })) continue;
    const filename = `demo-material-${index + 1}.pdf`;
    const filePath = path.join(uploadDirectory, filename);
    await fs.writeFile(filePath, createPdf(`UniRank demo resource: ${title}`));
    const stat = await fs.stat(filePath);
    await Material.create({
      title, description: 'Seeded demonstration resource. Replace this example with your own study material.',
      subjectId: subject._id, uploaderId: students[index % students.length]._id,
      fileUrl: `/uploads/${filename}`, fileName: filename, fileSize: stat.size, mimeType: 'application/pdf',
      fileType: fileTypes[index % fileTypes.length], targetTier: index % 2 ? 'max_distinction' : 'bare_minimum',
      upvotes: index % 7, status: 'approved', tags: ['demo', index % 2 ? 'distinction' : 'exam'],
    });
  }

  for (const subject of subjects) {
    subject.materialCount = await Material.countDocuments({ subjectId: subject._id, status: { $ne: 'rejected' } });
    await subject.save();
  }
  console.info('\nUniRank demo data is ready.');
  console.info('Admin: admin@unirank.demo / AdminPass123!');
  console.info('Professor: arta@unirank.demo / DemoPass123!');
  console.info('Student: student1@unirank.demo / DemoPass123!');
  console.info(`Checked ${subjects.length} subjects and 20 demonstration materials. Change demo credentials before deployment.`);
  await mongoose.disconnect();
} catch (error) {
  console.error('Seed failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
}
