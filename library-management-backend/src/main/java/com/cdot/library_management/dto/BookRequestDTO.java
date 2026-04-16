package com.cdot.library_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class BookRequestDTO {

    private Integer categoryId;
    private String title;
    private String author;
    private String isbn;
    private String callNumber;
    private String vendorName;
    private String invoiceNo;
    private BigDecimal price;
    private LocalDate receiptDate;
    private List<String> accessionNumbers;

    //getters and setters
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getCallNumber() { return callNumber; }
    public void setCallNumber(String callNumber) { this.callNumber = callNumber; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public LocalDate getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDate receiptDate) { this.receiptDate = receiptDate; }

    public List<String> getAccessionNumbers() { return accessionNumbers; }
    public void setAccessionNumbers(List<String> accessionNumbers) { this.accessionNumbers = accessionNumbers; }
}