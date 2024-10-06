'use client'

import React, { useEffect, useState } from "react";
import StoreCard from "@/components/business/store-card";
import useHttp from "@/hooks/common/use-http";
import { BusinessManagement } from "@/utils/endpoints";
import { useAccessToken } from "@/msal/use-access-token";
import { Store } from "@/models/business/models";
import { SkeletonCard } from "@/components/common/skeleton-card";
import { useRouter } from "next/navigation";
import AddCard from "@/components/common/add-card";
import AddStoreDialog from "@/components/business/add-store-dialog";
import ErrorPage from "@/app/error";
import {mockStores} from "@/mock/business/mock-data";
import Toast from "@/components/common/toast";

interface BusinessViewProps {
    isProtected: boolean;
}

const StoreCardGridContainer: React.FC<BusinessViewProps> = ({ isProtected }) => {
    const router = useRouter();
    const [showToast, setShowToast] = useState(false);
    const { loading, error, request } = useHttp();
    const [stores, setStores] = useState<Store[]>([]);
    const [showAddStoreDialog, setShowAddStoreDialog] = useState(false); // Manage AddStoreDialog visibility

    const scopes = [
        process.env.NEXT_PUBLIC_B2C_SCOPE_BUSINESS_MANAGEMENT_READ || "",
        process.env.NEXT_PUBLIC_B2C_SCOPE_BUSINESS_MANAGEMENT_WRITE || ""
    ];

    const accessToken = useAccessToken(isProtected ? scopes : []);

    useEffect(() => {
        if (isProtected && accessToken) {
            request(
                BusinessManagement.GetStores.Uri,
                BusinessManagement.GetStores.Method,
                null,
                undefined,
                accessToken
            ).then(response => {
                const mappedStores = response.map((store: any) => new Store(store));
                setStores(mappedStores);
            });
        } else {
            setStores(mockStores.map(store => new Store(store)));
        }
    }, [accessToken, isProtected, request]);

    const handleClick = (id: number) => {
        router.push(`/business/${id}`);
    };

    const handleAddStore = (newStore: { name: string; description: string }) => {
        // Example: Add the new store to the stores list
        const newStoreObject = new Store({
            id: Date.now(), // Generate a mock ID
            name: newStore.name,
            description: newStore.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            location: null,
            employees: []
        });
        console.log('handleAddStore');
        if (isProtected){
            console.log('isProtected');
        }else {
            setShowAddStoreDialog(false);
            setShowToast(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="flex w-full h-full items-center justify-center">
                    <div className="grid gap-4 md:grid-cols-1 md:gap-8 lg:grid-cols-2">
                        <SkeletonCard/>
                        <SkeletonCard/>
                        <SkeletonCard/>
                        <SkeletonCard/>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        const err = new Error(error)
        return (
            <ErrorPage error={err} reset={() => window.location.reload()}/>
        );
    }

    return (
        <div className="w-full h-full overflow-y-scroll items-center justify-center">
            <div className="container mx-auto mt-10">
                <text className="text-xl font-semibold">Select a store to manage</text>
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mt-4 mb-8 md:mb-0">
                    {stores.map((store) => (
                        <StoreCard
                            onClick={() => handleClick(store.id)}
                            key={store.id}
                            title={store.name}
                            content={store.description}
                            created_at={store.created_at}
                        />
                    ))}
                    <AddCard onClick={() => setShowAddStoreDialog(true)} /> {/* Open AddStoreDialog */}
                </div>
            </div>

            {/* Add Store Dialog */}
            <AddStoreDialog
                isOpen={showAddStoreDialog}
                onAdd={handleAddStore}
                onCancel={() => setShowAddStoreDialog(false)}
            />

            {showToast && (
                <Toast
                    message="You have to login to use that feature!"
                    type="error"
                    duration={3000}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default StoreCardGridContainer;
