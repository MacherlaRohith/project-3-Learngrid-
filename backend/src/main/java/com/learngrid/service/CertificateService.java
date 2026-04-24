package com.learngrid.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.learngrid.model.Certificate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class CertificateService {

    @Value("${frontend.url}")
    private String frontendUrl;

    public byte[] generateCertificatePdf(Certificate certificate) throws IOException, WriterException {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 28, Font.BOLD);
        Font subTitleFont = new Font(Font.HELVETICA, 18, Font.NORMAL);
        Font textFont = new Font(Font.HELVETICA, 14, Font.NORMAL);
        
        // Setup Title
        Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        title.setSpacingBefore(50);
        title.setSpacingAfter(30);
        document.add(title);
        
        Paragraph sub1 = new Paragraph("This is to certify that", subTitleFont);
        sub1.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(sub1);
        
        Paragraph studentName = new Paragraph(certificate.getEnrollment().getStudent().getUsername().toUpperCase(), titleFont);
        studentName.setAlignment(Paragraph.ALIGN_CENTER);
        studentName.setSpacingBefore(20);
        studentName.setSpacingAfter(20);
        document.add(studentName);
        
        Paragraph sub2 = new Paragraph("has successfully completed the course", subTitleFont);
        sub2.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(sub2);
        
        Paragraph courseName = new Paragraph("\"" + certificate.getEnrollment().getCourse().getTitle() + "\"", titleFont);
        courseName.setAlignment(Paragraph.ALIGN_CENTER);
        courseName.setSpacingBefore(20);
        courseName.setSpacingAfter(40);
        document.add(courseName);

        String dateStr = certificate.getIssuedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        Paragraph details = new Paragraph("Issued on: " + dateStr + "\nInstructor: " + certificate.getEnrollment().getCourse().getInstructor().getUsername(), textFont);
        details.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(details);

        // Generate QR Code payload
        String verificationUrl = frontendUrl + "/verify-certificate/" + certificate.getId();
        byte[] qrCodeImage = generateQRCodeImage(verificationUrl, 200, 200);
        
        Image img = Image.getInstance(qrCodeImage);
        img.setAlignment(Image.ALIGN_CENTER);
        img.setSpacingBefore(40);
        document.add(img);

        Paragraph verificationText = new Paragraph("Scan QR or verify at: " + verificationUrl, new Font(Font.HELVETICA, 10, Font.ITALIC));
        verificationText.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(verificationText);

        document.close();
        return out.toByteArray();
    }

    private byte[] generateQRCodeImage(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }
}
