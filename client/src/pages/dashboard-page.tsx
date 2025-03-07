import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  UserCog,
  Package2,
  Megaphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { MarketingCampaign } from "@shared/schema";

const DashboardPage: React.FC = () => {
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: campaigns = [] } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/marketing-campaigns"],
  });

  // Get active campaigns
  const activeCampaigns = campaigns.filter(c => 
    new Date(c.endDate) > new Date() && c.status === 'active'
  );

  // Get campaigns ending soon (within 7 days)
  const campaignsEndingSoon = campaigns.filter(c => {
    const endDate = new Date(c.endDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return endDate <= sevenDaysFromNow && endDate > new Date();
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">مؤشرات الأداء الرئيسية والتحليلات</p>
          </div>
          <Badge variant="outline" className="text-lg">
            {new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>

        {/* Campaign Alerts */}
        {campaignsEndingSoon.length > 0 && (
          <Alert>
            <AlertTitle>تنبيه الحملات</AlertTitle>
            <AlertDescription>
              لديك {campaignsEndingSoon.length} حملات تنتهي خلال 7 أيام
            </AlertDescription>
          </Alert>
        )}

        {/* معلومات إضافية */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">العملاء</CardTitle>
              <Users className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي عدد العملاء المسجلين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المواعيد</CardTitle>
              <Calendar className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">مواعيد اليوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
              <Package2 className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المنتجات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
              <UserCog className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي عدد الموظفين</p>
            </CardContent>
          </Card>

          {/* Add Campaign Performance Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">أداء الحملات</CardTitle>
              <Megaphone className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                حملات نشطة حالياً
              </p>
              {activeCampaigns.length > 0 && (
                <div className="mt-4 space-y-2">
                  {activeCampaigns.slice(0, 2).map(campaign => (
                    <div key={campaign.id} className="flex justify-between items-center">
                      <span className="text-sm truncate">{campaign.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(campaign.endDate).toLocaleDateString('ar-IQ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;