"use client";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
// components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// hooks
import { useToast } from "@/hooks/use-toast";
// server actions
import { createOffer } from "@/app/features/offers/server/actions/createOffer";

const initialFormState = {
  coupon_code: "",
  discount_type: "",
  discount_value: "",
  valid_from: new Date().toISOString().split("T")[0],
  valid_to: new Date().toISOString().split("T")[0],
  minimum_order_value: "",
  max_order_value: "",
  use_limit_per_user: "",
  use_limit: "",
  apllicable_for: "alluser",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="mt-3">
      Add
    </Button>
  );
}

export function AddOffer() {
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState("general");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requiredFields = {
      general: [
        "coupon_code",
        "discount_type",
        "discount_value",
        "valid_from",
        "valid_to",
      ],
      use: [
        "minimum_order_value",
        "max_order_value",
        "use_limit_per_user",
        "use_limit",
      ],
    };

    for (const tab in requiredFields) {
      const isTabValid = requiredFields[tab].every((field) => formData[field]);
      if (!isTabValid) {
        setActiveTab(tab);
        toast({
          variant: "destructive",
          title: `Please fill out all required fields in the ${tab.charAt(0).toUpperCase() + tab.slice(1)} tab.`,
        });
        return;
      }
    }
    console.log(formData, "Form is valid");
    const response = await createOffer(formData);
    toast({
      variant: response.status,
      title: response.message,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Offer</DialogTitle>
          <DialogDescription>
            This will help you create a new offer for your customers.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <form onSubmit={handleSubmit}>
          <Label>Coupon Code</Label>
          <Input
            placeholder="FLAT30"
            name="coupon_code"
            value={formData.coupon_code}
            onChange={handleInputChange}
            required
            className="mb-2"
          />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="use">Usage</TabsTrigger>
              <TabsTrigger value="product" disabled>
                Product
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <Label>Discount Type</Label>
              <Select
                name="discount_type"
                defaultValue={formData.discount_type}
                onValueChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    discount_type: e,
                  }));
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <Label>Discount Value</Label>
                  <Input
                    placeholder="30"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="w-1/2">
                  <Label>Max. Discount</Label>
                  <Input placeholder="Upto 75" name="discount_value" required />
                </div>
              </div>
              <Label>Valid From</Label>
              <Input
                placeholder="yyyy-mm-dd"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleInputChange}
                required
              />
              <Label>Expiry Date</Label>
              <Input
                placeholder="yyyy-mm-dd"
                name="valid_to"
                value={formData.valid_to}
                onChange={handleInputChange}
                required
              />
            </TabsContent>
            <TabsContent value="use">
              <div className="flex items-center gap-2 justify-between my-2">
                <div>
                  <Label>Min. Spend</Label>
                  <Input
                    placeholder="0"
                    name="minimum_order_value"
                    type="number"
                    value={formData.minimum_order_value}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label>Max. Spend</Label>
                  <Input
                    placeholder="100"
                    name="max_order_value"
                    type="number"
                    value={formData.max_order_value}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <Label>Applicable for</Label>
              <RadioGroup
                defaultValue="alluser"
                id="usertype"
                className="flex my-2"
                onValueChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    application_type: e,
                  }));
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alluser" id="alluser" />
                  <Label htmlFor="alluser">All Users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new">New User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="second" id="second" />
                  <Label htmlFor="second">Second Order</Label>
                </div>
              </RadioGroup>

              <Label>Use limit per user</Label>
              <Input
                placeholder="1"
                name="use_limit_per_user"
                type="number"
                value={formData.use_limit_per_user}
                onChange={handleInputChange}
                required
              />
              <Label>Use limit per offer</Label>
              <Input
                placeholder="1"
                name="use_limit"
                type="number"
                value={formData.use_limit}
                onChange={handleInputChange}
                required
              />
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
