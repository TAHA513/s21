
import { insertSupplierSchema } from "@shared/schema";
import express from 'express';
import multer from 'multer';
import { storage } from "./storage";
import type { Express } from "express";
import { createServer, type Server } from "http";

const upload = multer({ dest: 'uploads/' });

export async function setupRoutes(app: Express): Promise<Server> {
  // Staff Dashboard APIs
  app.get("/api/sales/today", async (_req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoices = await storage.getInvoices();
    const todaySales = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= today;
    });

    const total = todaySales.reduce((sum, invoice) => sum + Number(invoice.finalTotal), 0);

    res.json({
      total,
      count: todaySales.length,
      items: todaySales.map(invoice => ({
        id: invoice.id,
        amount: invoice.finalTotal,
        date: invoice.date,
        status: invoice.status,
        customerName: invoice.customerName
      }))
    });
  });

  app.get("/api/appointments/today", async (_req, res) => {
    try {
      const appointments = await storage.getAppointments();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
      });
      
      res.json(todayAppointments);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  const server = createServer(app);
  return server;
}
