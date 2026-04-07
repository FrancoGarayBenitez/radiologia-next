"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Medico } from "@/types";

interface SessionState {
    user: User | null;
    medico: Medico | null;
    loading: boolean;
}

export function useSession(): SessionState {
    const [state, setState] = useState<SessionState>({
        user: null,
        medico: null,
        loading: true,
    });

    useEffect(() => {
        const supabase = createClient();

        async function fetchSession() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setState({ user: null, medico: null, loading: false });
                return;
            }

            const { data: medico } = await supabase
                .from("personal")
                .select("*")
                .eq("id", user.id)
                .single();

            setState({ user, medico: medico ?? null, loading: false });
        }

        fetchSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            fetchSession();
        });

        return () => subscription.unsubscribe();
    }, []);

    return state;
}
