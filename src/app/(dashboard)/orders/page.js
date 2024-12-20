"use client";
import { useCallback } from "react";
import { useMediaQuery } from "@react-hook/media-query";
// components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderCard } from "@/app/features/orders/components/OrderCard";
// server actions
import { updateOrderStatus } from "@/app/features/orders/server/actions/getLiveOrder";
// context
import { useOrderContext } from "@/context/OrderContext";
import { useToast } from "@/hooks/use-toast";

const STATUS = {
  new: "pending",
  preparing: "processing",
  completed: "completed",
};

export default function LiveOrder() {
  const { liveOrder, setOrder } = useOrderContext();
  const { toast } = useToast();

  const changeOrderStatus = useCallback(
    async (orderId, fromStatus, toStatus) => {
      setOrder((prev) => {
        const fromItems = prev[fromStatus].filter(
          (existingItem) => existingItem.order_id !== orderId,
        );
        const toItems = [
          ...prev[toStatus],
          prev[fromStatus].find(
            (existingItem) => existingItem.order_id === orderId,
          ),
        ];
        return {
          ...prev,
          [toStatus]: toItems,
          [fromStatus]: fromItems,
        };
      });
      // Update the order status on the server
      const [error, response] = await updateOrderStatus(
        orderId,
        STATUS[toStatus],
      );
      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to update order status",
        });
        setOrder((prev) => {
          const fromItems = [
            ...prev[fromStatus],
            prev[toStatus].find(
              (existingItem) => existingItem.order_id === orderId,
            ),
          ];
          const toItems = prev[toStatus].filter(
            (existingItem) => existingItem.order_id !== orderId,
          );
          return {
            ...prev,
            [toStatus]: toItems,
            [fromStatus]: fromItems,
          };
        });
      }
    },
    [setOrder, toast],
  );

  const onDrop = async (event, toStatus) => {
    const orderId = event.dataTransfer.getData("order_id");
    const fromStatus = event.dataTransfer.getData("fromStatus");
    if (fromStatus === toStatus) return;
    changeOrderStatus(orderId, fromStatus, toStatus);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const onDragStart = (event, order, fromStatus) => {
    event.dataTransfer.setData("order_id", order.order_id);
    event.dataTransfer.setData("fromStatus", fromStatus);
  };

  const isDesktop = useMediaQuery("(min-width: 768px)", { noSsr: false });

  if (isDesktop) {
    return (
      <main
        className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto"
        suppressHydrationWarning
      >
        <div className="grid grid-cols-3 gap-4">
          {Object.keys(liveOrder).map((status, key) => (
            <div
              key={key}
              className="flex flex-col gap-4"
              onDrop={(event) => onDrop(event, status)}
              onDragOver={onDragOver}
            >
              <div className="text-lg font-bold flex gap-2 items-center">
                <span>{status.toUpperCase()}</span>
                <Badge className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {liveOrder[status].length}
                </Badge>
              </div>
              <Card className="bg-muted h-[80vh] overflow-y-scroll">
                <CardContent className="p-2">
                  {/* Order Card start */}
                  {liveOrder[status].map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      status={status}
                      changeOrderStatus={changeOrderStatus}
                      onDragStart={onDragStart}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    );
  }
  return (
    <main className="w-screen p-4 overflow-auto" suppressHydrationWarning>
      <Tabs defaultValue="new">
        <TabsList className="w-full">
          {Object.keys(liveOrder).map((status, key) => (
            <TabsTrigger value={status} asChild key={key}>
              <div className="flex">
                <span>{status.toUpperCase()}</span>
                <Badge className="flex ml-1 h-5 w-2 shrink-0 items-center justify-center text-sm">
                  {liveOrder[status].length}
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.keys(liveOrder).map((status, key) => (
          <TabsContent value={status} key={key}>
            <Card className="bg-muted h-[80vh] overflow-y-scroll">
              <CardContent className="p-2">
                {/* Order Card start */}
                {liveOrder[status].map((order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    status={status}
                    changeOrderStatus={changeOrderStatus}
                    onDragStart={onDragStart}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
